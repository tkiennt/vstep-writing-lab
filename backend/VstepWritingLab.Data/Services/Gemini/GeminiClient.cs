using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Text;
using System.Text.Json;
using VstepWritingLab.Business.Interfaces;

namespace VstepWritingLab.Data.Services.Gemini;

public class GeminiClient(
    HttpClient _http,
    IConfiguration _config,
    ILogger<GeminiClient> _logger) : IAiClient
{
    private string ApiKey     => _config["Gemini:ApiKey"]     ?? "";
    private string BaseModel  => _config["Gemini:BaseModel"]  ?? "gemini-2.5-flash";
    private string TunedModel => _config["Gemini:TunedModel"] ?? "";
    private bool   UseVertex  => _config.GetValue<bool>("VertexAI:UseVertexAI");
    private string Location   => _config["VertexAI:Location"] ?? "us-central1";

    public async Task<(string Text, string ModelUsed)> GenerateAsync(
        string systemPrompt,
        string userPrompt,
        int    maxTokens   = 4096,
        float  temperature = 0.1f,
        CancellationToken ct = default)
    {
        if (UseVertex && !string.IsNullOrEmpty(TunedModel))
        {
            try
            {
                var text = await CallVertexAsync(
                    systemPrompt, userPrompt, maxTokens, temperature, ct);
                return (text, "tuned");
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex,
                    "Tuned model failed — falling back to {BaseModel}", BaseModel);
            }
        }

        var fallback = await CallGeminiApiAsync(
            systemPrompt, userPrompt, maxTokens, temperature, ct);
        return (fallback, "base-fallback");
    }

    // ── Vertex AI ────────────────────────────────────────────────────

    private async Task<string> CallVertexAsync(
        string sys, string user, int maxTokens, float temp, CancellationToken ct)
    {
        var token = await GetADCTokenAsync(ct);
        // Vertex AI tuned model endpoint
        var url   = $"https://{Location}-aiplatform.googleapis.com/v1/{TunedModel}:generateContent";

        using var req = new HttpRequestMessage(HttpMethod.Post, url)
        {
            Content = new StringContent(
                JsonSerializer.Serialize(BuildBody(sys, user, maxTokens, temp)),
                Encoding.UTF8, "application/json")
        };
        req.Headers.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var resp = await _http.SendAsync(req, ct);
        var raw  = await resp.Content.ReadAsStringAsync(ct);
        if (!resp.IsSuccessStatusCode)
            throw new HttpRequestException($"Vertex {resp.StatusCode}: {raw[..Math.Min(300,raw.Length)]}");

        _logger.LogInformation("Tuned model grading completed");
        return ExtractText(raw);
    }

    // ── Gemini API (fallback) ─────────────────────────────────────────

    private async Task<string> CallGeminiApiAsync(
        string sys, string user, int maxTokens, float temp, CancellationToken ct)
    {
        var url = $"https://generativelanguage.googleapis.com/v1beta/models/{BaseModel}:generateContent?key={ApiKey}";

        for (int attempt = 0; attempt < 3; attempt++)
        {
            var resp = await _http.PostAsync(url,
                new StringContent(
                    JsonSerializer.Serialize(BuildBody(sys, user, maxTokens, temp)),
                    Encoding.UTF8, "application/json"), ct);
            var raw  = await resp.Content.ReadAsStringAsync(ct);

            if (resp.IsSuccessStatusCode) return ExtractText(raw);

            if ((int)resp.StatusCode is 429 or >= 500 && attempt < 2)
            {
                await Task.Delay(TimeSpan.FromSeconds(Math.Pow(2, attempt + 1)), ct);
                continue;
            }
            Console.WriteLine($"[GEMINI ERROR] {raw}");
            throw new HttpRequestException($"Gemini {resp.StatusCode}: {raw}");
        }
        throw new InvalidOperationException("Gemini API failed after 3 attempts");
    }

    // ── Helpers ───────────────────────────────────────────────────────

    private static object BuildBody(string sys, string user, int maxTokens, float temp) => new
    {
        system_instruction = new { parts = new[] { new { text = sys } } },
        contents           = new[] { new { role = "user", parts = new[] { new { text = user } } } },
        generationConfig   = new
        {
            temperature      = temp,
            maxOutputTokens  = maxTokens,
            responseMimeType = "application/json"
        }
    };

    private static string ExtractText(string json)
    {
        using var doc = JsonDocument.Parse(json);
        var sb        = new StringBuilder();
        foreach (var part in doc.RootElement
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")
            .EnumerateArray())
            if (part.TryGetProperty("text", out var t))
                sb.Append(t.GetString());
        return sb.ToString().Trim();
    }

    // ADC token — cached 55min, fetched via gcloud CLI
    private static string? _token;
    private static DateTime _tokenExpiry = DateTime.MinValue;
    private static readonly SemaphoreSlim _tokenLock = new(1, 1);

    private async Task<string> GetADCTokenAsync(CancellationToken ct)
    {
        await _tokenLock.WaitAsync(ct);
        try
        {
            if (_token != null && DateTime.UtcNow < _tokenExpiry)
                return _token;

            var psi = new System.Diagnostics.ProcessStartInfo
            {
                FileName               = "powershell",
                Arguments              = "-Command \"gcloud auth application-default print-access-token\"",
                RedirectStandardOutput = true,
                UseShellExecute        = false,
            };
            using var proc = System.Diagnostics.Process.Start(psi)
                ?? throw new InvalidOperationException(
                    "Cannot start gcloud. Run: gcloud auth application-default login");

            var tok = (await proc.StandardOutput.ReadToEndAsync(ct)).Trim();
            await proc.WaitForExitAsync(ct);

            if (string.IsNullOrEmpty(tok))
                throw new InvalidOperationException(
                    "Empty ADC token. Run: gcloud auth application-default login");

            _token       = tok;
            _tokenExpiry = DateTime.UtcNow.AddMinutes(55);
            return _token;
        }
        finally { _tokenLock.Release(); }
    }
}
