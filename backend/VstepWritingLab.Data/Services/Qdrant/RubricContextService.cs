using Microsoft.Extensions.Configuration;
using System.Text;
using System.Text.Json;
using VstepWritingLab.Domain.Interfaces;

namespace VstepWritingLab.Data.Services.Qdrant;

public class RubricContextService : IRubricContextService
{
    private static readonly Dictionary<string, string> _taskCache = new();


    public async Task<string> GetContextAsync(
        string essayText, string taskType, CancellationToken ct = default)
    {
        // Cache per task type
        if (_taskCache.TryGetValue(taskType, out var cached))
            return cached;

        var path = Path.Combine(AppContext.BaseDirectory, "data", "rubrics_enhanced.json");

        if (!File.Exists(path))
        {
            // Fallback nếu không có file
            return $"=== VSTEP RUBRIC ({taskType.ToUpper()}) ===\n" +
                   "Band 1-4: poor | Band 5-6: adequate | Band 7-8: good | Band 9-10: excellent";
        }

        var json = await File.ReadAllTextAsync(path, ct);
        using var doc = JsonDocument.Parse(json);

        var sb  = new StringBuilder();
        var key = $"vstep_{taskType}";

        sb.AppendLine($"=== VSTEP OFFICIAL RUBRIC ({taskType.ToUpper()}) ===");

        // Try task-specific key first, fall back to any key
        JsonElement taskEl = default;
        bool found = false;
        if (doc.RootElement.TryGetProperty(key, out taskEl))
        {
            found = true;
        }
        else
        {
            // rubrics_enhanced.json có thể dùng key khác — thử lấy first property
            foreach (var prop in doc.RootElement.EnumerateObject())
            {
                if (prop.Name.Contains(taskType))
                {
                    taskEl = prop.Value;
                    found = true;
                    break;
                }
            }
        }

        if (found && taskEl.ValueKind == JsonValueKind.Object &&
            taskEl.TryGetProperty("criteria", out var criteria))
        {
            foreach (var crit in criteria.EnumerateObject())
            {
                sb.AppendLine($"\n[{crit.Name.Replace("_", " ").ToUpper()}]");

                if (!crit.Value.TryGetProperty("descriptors", out var descs))
                    continue;

                foreach (var band in descs.EnumerateObject())
                {
                    if (band.Name == "0") continue; // skip band 0

                    string textEn = "", textVi = "";

                    if (band.Value.ValueKind == JsonValueKind.Object)
                    {
                        if (band.Value.TryGetProperty("text_en", out var te))
                            textEn = te.GetString() ?? "";
                        if (band.Value.TryGetProperty("text_vi", out var tv))
                            textVi = tv.GetString() ?? "";
                    }
                    else if (band.Value.ValueKind == JsonValueKind.String)
                    {
                        textEn = band.Value.GetString() ?? "";
                    }

                    sb.AppendLine($"  Band {band.Name}: {textEn}");
                    if (!string.IsNullOrWhiteSpace(textVi))
                        sb.AppendLine($"    VI: {textVi}");
                }
            }
        }
        else
        {
            // Fallback nếu không tìm thấy key
            sb.AppendLine("Band 1-4: poor | Band 5-6: adequate | Band 7-8: good | Band 9-10: excellent");
        }

        var result = sb.ToString();
        _taskCache[taskType] = result;
        return result;
    }
}

