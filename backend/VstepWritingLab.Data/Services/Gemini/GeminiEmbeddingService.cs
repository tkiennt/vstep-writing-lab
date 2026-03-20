using Microsoft.Extensions.Configuration;
using System.Text;
using System.Text.Json;

namespace VstepWritingLab.Data.Services.Gemini;

public class GeminiEmbeddingService(HttpClient _http, IConfiguration _config)
{
    private string ApiKey => _config["Gemini:ApiKey"] ?? "";
    private const string MODEL = "models/text-embedding-004";
    private const string BASE = "https://generativelanguage.googleapis.com/v1";

    public Task<float[]> EmbedDocumentAsync(string text) => EmbedAsync(text, "RETRIEVAL_DOCUMENT");
    public Task<float[]> EmbedQueryAsync(string text)    => EmbedAsync(text, "RETRIEVAL_QUERY");

    private async Task<float[]> EmbedAsync(string text, string taskType)
    {
        var url = $"{BASE}/{MODEL}:embedContent?key={ApiKey}";
        var body = new { model = MODEL, content = new { parts = new[] { new { text } } }, taskType };
        var resp = await _http.PostAsync(url,
            new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json"));
        resp.EnsureSuccessStatusCode();
        using var doc = JsonDocument.Parse(await resp.Content.ReadAsStringAsync());
        return doc.RootElement.GetProperty("embedding").GetProperty("values")
            .EnumerateArray().Select(v => v.GetSingle()).ToArray();
    }
}
