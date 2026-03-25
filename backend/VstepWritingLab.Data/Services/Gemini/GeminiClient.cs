using Google.Apis.Auth.OAuth2;
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
    private string ApiKey     => _config["ApiKey"]     ?? _config["Gemini:ApiKey"] ?? "";
    private string BaseModel  => _config["BaseModel"]  ?? _config["Gemini:BaseModel"] ?? "gemini-2.5-flash";
    private string TunedModel => _config["TunedModel"] ?? _config["Gemini:TunedModel"] ?? "";
    private bool   UseVertex  => _config.GetValue<bool>("VertexAI:UseVertexAI");
    private string Location   => _config["VertexAI:Location"] ?? "us-central1";

    public async Task<(string Text, string ModelUsed)> GenerateAsync(
        string systemPrompt,
        string userPrompt,
        int    maxTokens   = 16384,
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

        // ✅ Correct Vertex AI Endpoint prediction API (NOT :generateContent)
        var url = $"https://{Location}-aiplatform.googleapis.com/v1/{TunedModel}:predict";

        // ✅ Correct request body format for Vertex AI deployed endpoints
        var body = new
        {
            instances = new[]
            {
                new { content = $"{sys}\n\n{user}" }
            },
            parameters = new
            {
                temperature    = temp,
                maxOutputTokens = maxTokens
            }
        };

        using var req = new HttpRequestMessage(HttpMethod.Post, url)
        {
            Content = new StringContent(
                JsonSerializer.Serialize(body),
                Encoding.UTF8, "application/json")
        };
        req.Headers.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var resp = await _http.SendAsync(req, ct);
        var raw  = await resp.Content.ReadAsStringAsync(ct);
        if (!resp.IsSuccessStatusCode)
            throw new HttpRequestException($"Vertex {resp.StatusCode}: {raw[..Math.Min(300,raw.Length)]}");

        _logger.LogInformation("Tuned model grading completed");
        return ExtractVertexPredictText(raw);
    }

    /// <summary>
    /// Parses the Vertex AI :predict response format:
    /// { "predictions": [{ "content": "..." }] }
    /// Falls back to :generateContent format if predictions key is missing (for compatibility).
    /// </summary>
    private static string ExtractVertexPredictText(string json)
    {
        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;

        // :predict response format
        if (root.TryGetProperty("predictions", out var predictions) &&
            predictions.GetArrayLength() > 0)
        {
            var first = predictions[0];
            if (first.TryGetProperty("content", out var content))
                return content.GetString() ?? "";
            // Some models return outputs as direct string
            return first.GetString() ?? "";
        }

        // Fallback: try :generateContent format (candidates[0].content.parts[0].text)
        return ExtractText(json);
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

    // ── Token acquisition via Application Default Credentials (ADC) ──────
    // Best practice: set GOOGLE_APPLICATION_CREDENTIALS env var to the path of
    // your Service Account JSON key. The Google auth library resolves it automatically.
    // No key paths in config. No key files committed to git.
    //
    // Local dev:  set GOOGLE_APPLICATION_CREDENTIALS=D:\keys\vertex-sa-key.json
    // Docker:     -e GOOGLE_APPLICATION_CREDENTIALS=/secrets/vertex-sa-key.json
    // GCP (GCE/Cloud Run): no env var needed — uses the attached SA automatically

    private static string? _token;
    private static DateTime _tokenExpiry = DateTime.MinValue;
    private static readonly SemaphoreSlim _tokenLock = new(1, 1);
    private static readonly string[] _scopes = ["https://www.googleapis.com/auth/cloud-platform"];

    private async Task<string> GetADCTokenAsync(CancellationToken ct)
    {
        await _tokenLock.WaitAsync(ct);
        try
        {
            if (_token != null && DateTime.UtcNow < _tokenExpiry)
                return _token;

            // GoogleCredential.GetApplicationDefaultAsync() resolves credentials in this order:
            //   1. GOOGLE_APPLICATION_CREDENTIALS env var → your SA key JSON
            //   2. gcloud ADC (~/.config/gcloud/application_default_credentials.json)
            //   3. GCE/Cloud Run metadata server (when deployed on GCP)
            var credential = (await GoogleCredential.GetApplicationDefaultAsync(ct))
                .CreateScoped(_scopes);

            // ✅ Log which Service Account is actually being used — verify on startup
            if (credential.UnderlyingCredential is Google.Apis.Auth.OAuth2.ServiceAccountCredential saCred)
                _logger.LogInformation("Vertex AI: using Service Account {Email}", saCred.Id);
            else
                _logger.LogWarning("Vertex AI: credential is NOT a Service Account ({Type}). " +
                    "Set GOOGLE_APPLICATION_CREDENTIALS to your SA key file.",
                    credential.UnderlyingCredential.GetType().Name);

            var token = await credential
                .UnderlyingCredential
                .GetAccessTokenForRequestAsync(cancellationToken: ct);

            if (string.IsNullOrEmpty(token))
                throw new InvalidOperationException(
                    "Vertex AI: empty access token. " +
                    "Set GOOGLE_APPLICATION_CREDENTIALS to a Service Account key file " +
                    "that has roles/aiplatform.user on project vstep-writing-lab.");

            _logger.LogInformation("Vertex AI: token acquired (valid ~55 min)");
            _token       = token;
            _tokenExpiry = DateTime.UtcNow.AddMinutes(55);
            return _token;
        }
        finally { _tokenLock.Release(); }
    }
}
