using Microsoft.Extensions.Logging;
using System.Linq;
using System.Text;
using System.Text.Json;
using VstepWritingLab.Domain.Interfaces;
using VstepWritingLab.Domain.ValueObjects;

namespace VstepWritingLab.Data.Services.Gemini;

public class GeminiGradingService(
    GeminiClient _client,
    ILogger<GeminiGradingService> _logger)
    : IGradingAiService
{
    private const string SYSTEM_PROMPT = @"
You are an official VSTEP examiner from ULIS-VNU Hanoi with 10+ years experience.
Grade essays strictly per the VSTEP rubric. Score each criterion 0-10 (integers only).
Provide bilingual feedback. Return ONLY valid JSON, no markdown, no preamble.
";

    public async Task<Result<AiGradingOutput>> GradeAsync(
        string rubricContext, string taskType, string instruction,
        string[] keyPoints, int wordCount, string essayText,
        CancellationToken ct = default)
    {
        var userPrompt = $@"
=== VSTEP RUBRIC ===
{rubricContext}

=== EXAM PROMPT ===
Type       : {taskType}
Instruction: {instruction}
Key points :
{string.Join("\n", keyPoints.Select(p => "- " + p))}

=== STUDENT ESSAY ({wordCount} words) ===
{essayText}

=== REQUIRED JSON (fill all fields) ===
{{
  ""task_relevance"": {{
    ""is_relevant"": bool, ""relevance_score"": 0-10,
    ""verdict_en"": """", ""verdict_vi"": """",
    ""missing_points_en"": [], ""missing_points_vi"": [],
    ""off_topic_sentences"": []
  }},
  ""taskFulfilment"": {{""score"":0-10,""evidence_en"":"""",""feedback_en"":"""",""feedback_vi"":""""}},
  ""organization"":   {{""score"":0-10,""evidence_en"":"""",""feedback_en"":"""",""feedback_vi"":""""}},
  ""vocabulary"":     {{""score"":0-10,""evidence_en"":"""",""feedback_en"":"""",""feedback_vi"":""""}},
  ""grammar"":        {{""score"":0-10,""evidence_en"":"""",""feedback_en"":"""",""feedback_vi"":""""}},
  ""strengths_en"": [], ""strengths_vi"": [],
  ""improvements_en"": [], ""improvements_vi"": [],
  ""corrections"": [{{""original"":"""",""corrected"":"""",""reason_en"":"""",""reason_vi"":""""}}],
  ""inline_highlights"": [
    {{""type"":""error|strength"",""quote"":""<VERBATIM from essay>"",
     ""issue"":"""",""issue_vi"":"""",""fix"":"""",""category"":""grammar|vocabulary|organization|taskFulfilment""}}
  ],
  ""recommended_structures"": [
    {{""structure_name"":"""",""example"":"""",""why_use_it_vi"":""""}}
  ],
  ""rewrite_samples"": [
    {{""original"":""<VERBATIM from essay>"",""rewritten"":"""",""explanation_vi"":""""}}
  ],
  ""roadmap"": {{
    ""current_level"":"""",""target_level"":"""",""estimated_weeks"":4-8,
    ""weekly_plan"":[{{""week"":1,""focus"":"""",""tasks"":[""""],""goal"":""""}}]
  }}
}}

RULES:
- inline_highlights: min 3 errors + min 1 strength, quote MUST be verbatim
- rewrite_samples: 2 weakest sentences, original MUST be verbatim
- roadmap: estimated_weeks entries, max 8, each week targets weakest criterion first
- tasks: specific (""practice gerund after 'look forward to'""), not vague (""study grammar"")
";

        try
        {
            // Use a dedicated timeout (3 min) — don't use the HTTP request's CT,
            // so a browser disconnect doesn't cancel an in-flight Gemini call.
            using var aiCts = new CancellationTokenSource(TimeSpan.FromMinutes(3));
            var (rawJson, modelUsed) = await _client.GenerateAsync(SYSTEM_PROMPT, userPrompt, maxTokens: 16384, ct: aiCts.Token);
            var parsed = ParseAiGradingOutput(rawJson, modelUsed);
            
            if (parsed == null)
            {
                return Result<AiGradingOutput>.Fail("Failed to parse AI response into valid JSON");
            }
            
            // Map to Domain AiGradingOutput
            // Note: Since Domain definition is simpler, we might need to broaden it later,
            // but for now we follow the user's internal DTO request.
            return Result<AiGradingOutput>.Ok(MapToDomainOutput(parsed));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Grading service failed");
            return Result<AiGradingOutput>.Fail(ex.Message);
        }
    }

    private InternalAiOutput? ParseAiGradingOutput(string json, string modelUsed)
    {
        _logger.LogDebug("Raw AI JSON (first 500 chars): {Json}", json.Length > 500 ? json[..500] : json);
        try
        {
            // Extract the outermost JSON object (strips ```json fences, preambles, etc.)
            var startIndex = json.IndexOf('{');
            var endIndex = json.LastIndexOf('}');
            if (startIndex >= 0 && endIndex >= startIndex)
            {
                json = json.Substring(startIndex, endIndex - startIndex + 1);
            }
            else
            {
                json = json.Trim();
            }

            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var output = JsonSerializer.Deserialize<InternalAiOutput>(json, options);

            if (output != null)
            {
                output.ModelUsed = modelUsed;
                return output;
            }
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to parse AI JSON response: {Json}", json.Length > 500 ? json[..500] : json);
            return null;
        }
    }

    private AiGradingOutput MapToDomainOutput(InternalAiOutput raw)
    {
        var rel = raw.Task_Relevance ?? new InternalRelevance();
        var tf  = raw.TaskFulfilment  ?? new RawCriterion();
        var org = raw.Organization    ?? new RawCriterion();
        var voc = raw.Vocabulary      ?? new RawCriterion();
        var grm = raw.Grammar         ?? new RawCriterion();
        var rd  = raw.Roadmap         ?? new RawRoadmap();

        return new AiGradingOutput(
            Relevance: new TaskRelevance(
                rel.Is_Relevant,
                rel.Relevance_Score,
                new[] { rel.Verdict_En, rel.Verdict_Vi },
                rel.Missing_Points_En.Concat(rel.Missing_Points_Vi).ToArray(),
                rel.Off_Topic_Sentences
            ),
            TaskFulfilment: new CriterionScore(
                tf.Score, CriterionScore.GetBandLabel(tf.Score),
                tf.Feedback_En, tf.Feedback_Vi, tf.Evidence_En
            ),
            Organization: new CriterionScore(
                org.Score, CriterionScore.GetBandLabel(org.Score),
                org.Feedback_En, org.Feedback_Vi, org.Evidence_En
            ),
            Vocabulary: new CriterionScore(
                voc.Score, CriterionScore.GetBandLabel(voc.Score),
                voc.Feedback_En, voc.Feedback_Vi, voc.Evidence_En
            ),
            Grammar: new CriterionScore(
                grm.Score, CriterionScore.GetBandLabel(grm.Score),
                grm.Feedback_En, grm.Feedback_Vi, grm.Evidence_En
            ),
            StrengthsVi: raw.Strengths_Vi,
            ImprovementsVi: raw.Improvements_Vi,
            Corrections: raw.Corrections.Select(c =>
                new Correction(c.Original, c.Corrected, c.Reason_En, c.Reason_Vi)
            ).ToArray(),
            InlineHighlights: raw.Inline_Highlights.Select(h =>
                new InlineHighlight(h.Type, h.Quote, h.Issue, h.Issue_Vi, h.Fix, h.Category)
            ).ToArray(),
            RecommendedStructures: raw.Recommended_Structures.Select(s =>
                new RecommendedStructure(s.Structure_Name, s.Example, s.Why_Use_It_Vi)
            ).ToArray(),
            RewriteSamples: raw.Rewrite_Samples.Select(r =>
                new RewriteSample(r.Original, r.Rewritten, r.Explanation_Vi)
            ).ToArray(),
            Roadmap: new GradingRoadmap(
                rd.Current_Level,
                rd.Target_Level,
                rd.Estimated_Weeks,
                rd.Weekly_Plan.Select(wp =>
                    new WeeklyPlanTask(wp.Week, wp.Focus, wp.Tasks, wp.Goal)
                ).ToArray()
            ),
            AiModel: raw.ModelUsed
        );
    }
}

// ── Internal records for JSON mapping ───────────────────────────

// ── Internal records for JSON mapping ───────────────────────────

internal class InternalAiOutput
{
    [System.Text.Json.Serialization.JsonPropertyName("task_relevance")]
    public InternalRelevance? Task_Relevance { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("taskFulfilment")]
    public RawCriterion? TaskFulfilment { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("organization")]
    public RawCriterion? Organization { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("vocabulary")]
    public RawCriterion? Vocabulary { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("grammar")]
    public RawCriterion? Grammar { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("strengths_en")]
    public string[] Strengths_En { get; set; } = [];

    [System.Text.Json.Serialization.JsonPropertyName("strengths_vi")]
    public string[] Strengths_Vi { get; set; } = [];

    [System.Text.Json.Serialization.JsonPropertyName("improvements_en")]
    public string[] Improvements_En { get; set; } = [];

    [System.Text.Json.Serialization.JsonPropertyName("improvements_vi")]
    public string[] Improvements_Vi { get; set; } = [];

    [System.Text.Json.Serialization.JsonPropertyName("corrections")]
    public RawCorrection[] Corrections { get; set; } = [];

    [System.Text.Json.Serialization.JsonPropertyName("inline_highlights")]
    public RawHighlight[] Inline_Highlights { get; set; } = [];

    [System.Text.Json.Serialization.JsonPropertyName("recommended_structures")]
    public RawStructure[] Recommended_Structures { get; set; } = [];

    [System.Text.Json.Serialization.JsonPropertyName("rewrite_samples")]
    public RawRewrite[] Rewrite_Samples { get; set; } = [];

    [System.Text.Json.Serialization.JsonPropertyName("roadmap")]
    public RawRoadmap? Roadmap { get; set; }

    public string ModelUsed { get; set; } = "";
}

internal class InternalRelevance
{
    [System.Text.Json.Serialization.JsonPropertyName("is_relevant")]
    public bool Is_Relevant { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("relevance_score")]
    public int Relevance_Score { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("verdict_en")]
    public string Verdict_En { get; set; } = "";

    [System.Text.Json.Serialization.JsonPropertyName("verdict_vi")]
    public string Verdict_Vi { get; set; } = "";

    [System.Text.Json.Serialization.JsonPropertyName("missing_points_en")]
    public string[] Missing_Points_En { get; set; } = [];

    [System.Text.Json.Serialization.JsonPropertyName("missing_points_vi")]
    public string[] Missing_Points_Vi { get; set; } = [];

    [System.Text.Json.Serialization.JsonPropertyName("off_topic_sentences")]
    public string[] Off_Topic_Sentences { get; set; } = [];
}

internal class RawCriterion
{
    [System.Text.Json.Serialization.JsonPropertyName("score")]
    public int Score { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("evidence_en")]
    public string Evidence_En { get; set; } = "";

    [System.Text.Json.Serialization.JsonPropertyName("feedback_en")]
    public string Feedback_En { get; set; } = "";

    [System.Text.Json.Serialization.JsonPropertyName("feedback_vi")]
    public string Feedback_Vi { get; set; } = "";
}

internal class RawCorrection
{
    [System.Text.Json.Serialization.JsonPropertyName("original")]
    public string Original { get; set; } = "";

    [System.Text.Json.Serialization.JsonPropertyName("corrected")]
    public string Corrected { get; set; } = "";

    [System.Text.Json.Serialization.JsonPropertyName("reason_en")]
    public string Reason_En { get; set; } = "";

    [System.Text.Json.Serialization.JsonPropertyName("reason_vi")]
    public string Reason_Vi { get; set; } = "";
}

internal class RawHighlight
{
    [System.Text.Json.Serialization.JsonPropertyName("type")]
    public string Type { get; set; } = "";

    [System.Text.Json.Serialization.JsonPropertyName("quote")]
    public string Quote { get; set; } = "";

    [System.Text.Json.Serialization.JsonPropertyName("issue")]
    public string Issue { get; set; } = "";

    [System.Text.Json.Serialization.JsonPropertyName("issue_vi")]
    public string Issue_Vi { get; set; } = "";

    [System.Text.Json.Serialization.JsonPropertyName("fix")]
    public string Fix { get; set; } = "";

    [System.Text.Json.Serialization.JsonPropertyName("category")]
    public string Category { get; set; } = "";
}

internal class RawStructure
{
    [System.Text.Json.Serialization.JsonPropertyName("structure_name")]
    public string Structure_Name { get; set; } = "";

    [System.Text.Json.Serialization.JsonPropertyName("example")]
    public string Example { get; set; } = "";

    [System.Text.Json.Serialization.JsonPropertyName("why_use_it_vi")]
    public string Why_Use_It_Vi { get; set; } = "";
}

internal class RawRewrite
{
    [System.Text.Json.Serialization.JsonPropertyName("original")]
    public string Original { get; set; } = "";

    [System.Text.Json.Serialization.JsonPropertyName("rewritten")]
    public string Rewritten { get; set; } = "";

    [System.Text.Json.Serialization.JsonPropertyName("explanation_vi")]
    public string Explanation_Vi { get; set; } = "";
}

internal class RawRoadmap
{
    [System.Text.Json.Serialization.JsonPropertyName("current_level")]
    public string Current_Level { get; set; } = "";

    [System.Text.Json.Serialization.JsonPropertyName("target_level")]
    public string Target_Level { get; set; } = "";

    [System.Text.Json.Serialization.JsonPropertyName("estimated_weeks")]
    public int Estimated_Weeks { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("weekly_plan")]
    public RawWeeklyPlan[] Weekly_Plan { get; set; } = [];
}

internal class RawWeeklyPlan
{
    [System.Text.Json.Serialization.JsonPropertyName("week")]
    public int Week { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("focus")]
    public string Focus { get; set; } = "";

    [System.Text.Json.Serialization.JsonPropertyName("tasks")]
    public string[] Tasks { get; set; } = [];

    [System.Text.Json.Serialization.JsonPropertyName("goal")]
    public string Goal { get; set; } = "";
}

