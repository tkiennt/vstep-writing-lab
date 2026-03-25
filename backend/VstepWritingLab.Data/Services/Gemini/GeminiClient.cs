using Google.Apis.Auth.OAuth2;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Text;
using System.Text.Json;
using System.Net.Http.Headers;
using VstepWritingLab.Business.Interfaces;

namespace VstepWritingLab.Data.Services.Gemini;

public class GeminiClient(
    HttpClient _http,
    IConfiguration _config,
    ILogger<GeminiClient> _logger) : IAiClient
{
    private string TunedModel => _config["Gemini:TunedModel"] ?? "";
    private string BaseModel  => _config["Gemini:BaseModel"]  ?? "gemini-2.5-flash";
    private string SAKeyPath  => _config["Gemini:ServiceAccountKeyPath"] ?? "vertex-sa-key.json";

    private const string SCOPE = "https://www.googleapis.com/auth/cloud-platform";
    private readonly JsonSerializerOptions _jsonOptions = new() { PropertyNameCaseInsensitive = true };

    public async Task<(string Text, string ModelUsed)> GenerateAsync(
        string systemPrompt,
        string userPrompt,
        int maxTokens = 4096,
        float temperature = 0.1f,
        CancellationToken ct = default)
    {
        // Try Tuned Model first
        if (!string.IsNullOrEmpty(TunedModel))
        {
            try
            {
                var text = await CallGeminiApiAsync(TunedModel, systemPrompt, userPrompt, maxTokens, temperature, ct);
                return (text, TunedModel);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Tuned model grading failed. Falling back to {BaseModel}", BaseModel);
            }
        }

        // Fallback to Base Model
        var fallbackText = await CallGeminiApiAsync(BaseModel, systemPrompt, userPrompt, maxTokens, temperature, ct);
        return (fallbackText, "fallback-base");
    }

    private async Task<string> CallGeminiApiAsync(
        string modelName, 
        string sys, 
        string user, 
        int maxTokens, 
        float temp, 
        CancellationToken ct)
    {
        int maxRetries = 3;
        int delayMs = 1000;
        string location = "us-central1"; 
        string projectId = "vstep-writing-lab";
        string host = $"{location}-aiplatform.googleapis.com";

        for (int attempt = 1; attempt <= maxRetries; attempt++)
        {
            try
            {
                // 1. Get OAuth2 Token
                var token = await GetOAuthTokenAsync(ct);

                // 2. Prepare URL
                // Note: Vertex AI supports :generateContent on both models and endpoints
                string url;
                if (modelName.Contains("endpoints/"))
                {
                    // Call the deployed tuned endpoint
                    url = $"https://{host}/v1/{modelName}:generateContent";
                }
                else
                {
                    // Call the base model on Vertex AI
                    url = $"https://{host}/v1/projects/{projectId}/locations/{location}/publishers/google/models/{modelName}:generateContent";
                }

                // 3. Prepare Body (Modern Gemini format supported by Vertex AI :generateContent)
                var body = new
                {
                    system_instruction = new { parts = new[] { new { text = sys } } },
                    contents = new[] { new { role = "user", parts = new[] { new { text = user } } } },
                    generationConfig = new
                    {
                        temperature = temp,
                        maxOutputTokens = maxTokens,
                        responseMimeType = "application/json"
                    }
                };

                // 4. Send Request with 60s timeout
                using var requestCts = new CancellationTokenSource(TimeSpan.FromSeconds(60));
                using var linkedCts  = CancellationTokenSource.CreateLinkedTokenSource(ct, requestCts.Token);

                using var request = new HttpRequestMessage(HttpMethod.Post, url)
                {
                    Content = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json")
                };
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

                var response = await _http.SendAsync(request, linkedCts.Token);
                var rawResponse = await response.Content.ReadAsStringAsync(linkedCts.Token);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning("Gemini Vertex API Attempt {Attempt} failed ({Status}): {Raw}", attempt, response.StatusCode, rawResponse);
                    
                    // Retry on transient errors (429, 500, 503)
                    if (((int)response.StatusCode == 429 || (int)response.StatusCode >= 500) && attempt < maxRetries)
                    {
                        await Task.Delay(delayMs * attempt, ct);
                        continue;
                    }

                    throw new HttpRequestException($"Gemini Vertex API error: {response.StatusCode} - {rawResponse}");
                }

                return ExtractText(rawResponse);
            }
            catch (OperationCanceledException) when (!ct.IsCancellationRequested)
            {
                _logger.LogWarning("Gemini Vertex API Attempt {Attempt} timed out after 15s for model {Model}", attempt, modelName);
                if (attempt < maxRetries)
                {
                    await Task.Delay(delayMs * attempt, ct);
                    continue;
                }
                throw new TimeoutException($"Gemini Vertex request timed out for {modelName} after {maxRetries} attempts.");
            }
            catch (Exception ex) when (attempt < maxRetries)
            {
                _logger.LogWarning(ex, "Gemini Vertex API Attempt {Attempt} encountered an error. Retrying...", attempt);
                await Task.Delay(delayMs * attempt, ct);
            }
        }

        throw new Exception($"Gemini Vertex API calls failed after {maxRetries} attempts.");
    }

    private async Task<string> GetOAuthTokenAsync(CancellationToken ct)
    {
        try
        {
            // Load key from file
            var keyPath = System.IO.Path.Combine(AppDomain.CurrentDomain.BaseDirectory, SAKeyPath);
            if (!System.IO.File.Exists(keyPath))
            {
                // Try relative to workspace root if base directory fails
                keyPath = SAKeyPath;
            }

            var credential = GoogleCredential.FromFile(keyPath).CreateScoped(SCOPE);
            return await credential.UnderlyingCredential.GetAccessTokenForRequestAsync(cancellationToken: ct);
        }
        catch (Exception ex)
        {
            _logger.LogCritical(ex, "Failed to generate OAuth2 token from service account key.");
            throw;
        }
    }

    private string ExtractText(string json)
    {
        using var doc = JsonDocument.Parse(json);
        var candidates = doc.RootElement.GetProperty("candidates");
        if (candidates.GetArrayLength() == 0) return "";

        var parts = candidates[0].GetProperty("content").GetProperty("parts");
        var sb = new StringBuilder();
        foreach (var part in parts.EnumerateArray())
        {
            if (part.TryGetProperty("text", out var t))
                sb.Append(t.GetString());
        }
        return sb.ToString().Trim();
    }
}
