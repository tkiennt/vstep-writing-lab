using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Text;
using System.Text.Json;

namespace VstepWritingLab.Data.Services.Gemini;

/// <param name="ModelUsed">e.g. tuned, base-fallback</param>
public sealed record GeminiGenerateResult(string Text, string ModelUsed, string? FinishReason);

public class GeminiClient(
    HttpClient _http,
    IConfiguration _config,
    ILogger<GeminiClient> _logger)
{
    private string ApiKey     => _config["Gemini:ApiKey"]     ?? "";
    private string BaseModel  => _config["Gemini:BaseModel"]  ?? "gemini-2.0-flash";
    private string TunedModel => _config["Gemini:TunedModel"] ?? "";
    private bool   UseVertex  => _config.GetValue<bool>("VertexAI:UseVertexAI");
    private string Location   => _config["VertexAI:Location"] ?? "us-central1";

    public async Task<GeminiGenerateResult> GenerateAsync(
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
                return await CallVertexAsync(
                    systemPrompt, userPrompt, maxTokens, temperature, ct);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex,
                    "Tuned model failed — falling back to {BaseModel}", BaseModel);
            }
        }

        return await CallGeminiApiAsync(
            systemPrompt, userPrompt, maxTokens, temperature, ct);
    }

    // ── Vertex AI ────────────────────────────────────────────────────

    private async Task<GeminiGenerateResult> CallVertexAsync(
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

        var parsed = ParseGenerateResponse(raw);
        LogFinishReason(parsed.FinishReason, parsed.Text.Length, "vertex-tuned");
        if (!string.IsNullOrEmpty(parsed.BlockReason))
            throw new InvalidOperationException($"Gemini blocked content: {parsed.BlockReason}");

        _logger.LogInformation("Tuned model grading completed");
        return new GeminiGenerateResult(parsed.Text, "tuned", parsed.FinishReason);
    }

    // ── Gemini API (fallback) ─────────────────────────────────────────

    private async Task<GeminiGenerateResult> CallGeminiApiAsync(
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

            if (resp.IsSuccessStatusCode)
            {
                var parsed = ParseGenerateResponse(raw);
                LogFinishReason(parsed.FinishReason, parsed.Text.Length, BaseModel);
                if (!string.IsNullOrEmpty(parsed.BlockReason))
                    throw new InvalidOperationException($"Gemini blocked content: {parsed.BlockReason}");
                return new GeminiGenerateResult(parsed.Text, "base-fallback", parsed.FinishReason);
            }

            var code = (int)resp.StatusCode;
            if ((code == 429 || code >= 500) && attempt < 2)
            {
                await Task.Delay(TimeSpan.FromSeconds(Math.Pow(2, attempt + 1)), ct);
                continue;
            }
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

    private static (string Text, string? FinishReason, string? BlockReason) ParseGenerateResponse(string raw)
    {
        try
        {
            using var doc = JsonDocument.Parse(raw);
            var root = doc.RootElement;

            if (root.TryGetProperty("promptFeedback", out var pf) &&
                pf.TryGetProperty("blockReason", out var br))
                return ("", null, br.GetString());

            if (!root.TryGetProperty("candidates", out var candArr) || candArr.GetArrayLength() == 0)
                return ("", null, null);

            var c0 = candArr[0];
            var finish = c0.TryGetProperty("finishReason", out var fr) ? fr.GetString() : null;

            if (!c0.TryGetProperty("content", out var content))
                return ("", finish, null);

            var sb = new StringBuilder();
            if (content.TryGetProperty("parts", out var parts))
            {
                foreach (var part in parts.EnumerateArray())
                    if (part.TryGetProperty("text", out var t))
                        sb.Append(t.GetString());
            }

            return (sb.ToString().Trim(), finish, null);
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException("Could not parse Gemini generateContent response JSON.", ex);
        }
    }

    private void LogFinishReason(string? finishReason, int textLen, string modelLabel)
    {
        if (string.IsNullOrEmpty(finishReason) || finishReason == "STOP")
            return;
        _logger.LogWarning(
            "Gemini finishReason={FinishReason} model={Model} textLen={Len}",
            finishReason, modelLabel, textLen);
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
