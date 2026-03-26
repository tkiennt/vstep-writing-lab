using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Text;
using System.Text.Json;
using VstepWritingLab.Domain.Interfaces;

namespace VstepWritingLab.Data.Services.Qdrant;

public class RubricContextService : IRubricContextService
{
    private static readonly Dictionary<string, string> _taskCache = new();
    private readonly ILogger<RubricContextService> _logger;

    public RubricContextService(ILogger<RubricContextService> logger)
    {
        _logger = logger;
    }

    public async Task<string> GetContextAsync(
        string essayText, string taskType, CancellationToken ct = default)
    {
        // Cache per task type
        if (_taskCache.TryGetValue(taskType, out var cached))
            return cached;

        // Fallback detailed rubric if JSON file is missing
        var detailedFallback = $@"=== OFFICIAL VSTEP RUBRIC (TASK 2 - STRICT) ===
[TASK FULFILMENT]
- 0-3: Extremely short, off-topic, or fails to address any part of the prompt.
- 4-5: Partially addresses the prompt, but arguments are under-developed or repetitive.
- 6-7: Addresses all parts of the prompt clearly. Main ideas are supported.
- 8-10: Fully developed arguments with sophisticated examples and total relevance.

[ORGANIZATION]
- 0-3: No paragraphing, logic is missing, or severe lack of cohesive devices.
- 4-5: Limited cohesion, repetitive linkers, or paragraphing is present but not always logical.
- 6-7: Logical structure, clear paragraphing, and good use of transition words.
- 8-10: Seamless flow, sophisticated organizational patterns, and masterful use of variety.

[VOCABULARY]
- 0-3: Very limited range, frequent errors that impede basic communication.
- 4-5: Adequate range for the task, but with noticeable errors in word choice/collocation.
- 6-7: Good range of vocabulary with some less common items and good control.
- 8-10: Wide range of sophisticated vocabulary used accurately and naturally.

[GRAMMAR]
- 0-3: Frequent basic errors that obscure meaning. Very limited sentence variety.
- 4-5: Mix of simple and complex sentences. Errors are frequent but rarely impede communication.
- 6-7: Good control of grammar with mostly error-free complex sentences.
- 8-10: Wide range of complex structures used with full accuracy and precision.

SCORING RULE: Be a STRICT examiner. Do NOT give 10.0 unless the essay is perfect near-native level. If the essay is short (<100 words for Task 2), penalize significantly (max score 5).
";

        // Search in multiple possible paths (Production / Development / Docs)
        var possiblePaths = new[]
        {
            Path.Combine(AppContext.BaseDirectory, "data", "rubrics_enhanced.json"),
            Path.Combine(AppContext.BaseDirectory, "../../../data", "rubrics_enhanced.json"), 
            Path.Combine(AppContext.BaseDirectory, "../../../../../docs", "rubrics_enhanced.json"), 
            Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "docs", "rubrics_enhanced.json"),
            "docs/rubrics_enhanced.json",
            "../docs/rubrics_enhanced.json",
            "backend/VstepWritingLab.Data/data/rubrics_enhanced.json"
        };

        string? path = null;
        foreach (var p in possiblePaths)
        {
            if (File.Exists(p)) { path = p; break; }
        }

        if (string.IsNullOrEmpty(path))
        {
            _logger.LogWarning("Rubric file missing in all known locations. Using detailed fallback.");
            _taskCache[taskType] = detailedFallback;
            return detailedFallback;
        }

        _logger.LogInformation("Found rubric at: {Path}", Path.GetFullPath(path));

        try 
        {
            var json = await File.ReadAllTextAsync(path, ct);
            using var doc = JsonDocument.Parse(json);

            var sb  = new StringBuilder();
            var key = $"vstep_{taskType}";

            sb.AppendLine($"=== VSTEP OFFICIAL RUBRIC ({taskType.ToUpper()}) ===");

            JsonElement taskEl = default;
            bool found = false;
            
            if (doc.RootElement.TryGetProperty(key, out taskEl)) {
                found = true;
            }
            else {
                foreach (var prop in doc.RootElement.EnumerateObject()) {
                    if (prop.Name.Contains(taskType)) { 
                        taskEl = prop.Value; 
                        found = true; 
                        break; 
                    }
                }
            }

            if (found && taskEl.ValueKind == JsonValueKind.Object && taskEl.TryGetProperty("criteria", out var criteria)) {
                foreach (var crit in criteria.EnumerateObject()) {
                    sb.AppendLine($"\n[{crit.Name.Replace("_", " ").ToUpper()}]");
                    if (!crit.Value.TryGetProperty("descriptors", out var descs)) continue;
                    foreach (var band in descs.EnumerateObject()) {
                        if (band.Name == "0") continue;
                        string textEn = "";
                        if (band.Value.ValueKind == JsonValueKind.Object) {
                            if (band.Value.TryGetProperty("text_en", out var te)) textEn = te.GetString() ?? "";
                        } else if (band.Value.ValueKind == JsonValueKind.String) textEn = band.Value.GetString() ?? "";
                        sb.AppendLine($"  Band {band.Name}: {textEn}");
                    }
                }
                var finalResult = sb.ToString();
                _taskCache[taskType] = finalResult;
                return finalResult;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to parse rubric file. Using detailed fallback.");
        }

        _taskCache[taskType] = detailedFallback;
        return detailedFallback;
    }
}
