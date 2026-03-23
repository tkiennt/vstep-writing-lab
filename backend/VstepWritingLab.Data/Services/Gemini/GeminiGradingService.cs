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
    private static string BuildSystemPrompt(string mode, string language) => mode switch
    {
        "guide" => $@"
You are an expert VSTEP writing coach from ULIS-VNU Hanoi.
The student wants GUIDANCE ONLY — do NOT grade, do NOT write full sentences.
Analyze the topic, create an outline, suggest sentence STARTERS only.
Match suggestions to student's level: B1=simple, B2=complex, C1=advanced.
Personalize based on student's known weaknesses.
IMPORTANT: Provide all feedback and suggestions strictly in {(language == "vi" ? "Vietnamese" : "English")}.
Return ONLY valid JSON, no markdown.",

        "practice" => $@"
You are a VSTEP writing tutor from ULIS-VNU Hanoi.
Grade lightly — focus on 2 key improvements, keep feedback encouraging.
IMPORTANT: Provide all feedback and suggestions strictly in {(language == "vi" ? "Vietnamese" : "English")}.
Return ONLY valid JSON, no markdown.",

        _ => $@"
You are an expert English writing tutor. Your task is to evaluate a student’s essay and provide structured feedback according to the rules provided. Follow these steps precisely:

1. Sentence Feedback: Analyze meaningful sentences, skip boilerplate/standard signatures. Mark good sentences as is_good:true. Provide clear explanation and suggestions for weak sentences.
2. Improvement Tracking: Compare with user history provided.
3. Estimated Level: Use the VSTEP scoring logic (4.0-5.5=Bậc 3, etc.).
4. Inline Highlights: Min 3 errors, min 1 strength.
5. Rewrite Samples: 2 weakest sentences.
6. Roadmap: Dynamic 8-week plan based on this specific essay analysis.

IMPORTANT: Provide all feedback (summary, explanations, suggestions, roadmap) strictly in {(language == "vi" ? "Vietnamese" : "English")}.
Return ONLY valid JSON, no markdown, no preamble."
    };

    private static string BuildHistoryContext(UserHistory? h)
    {
        if (h == null) return "";
        var avg = h.PastScores.Length > 0
            ? h.PastScores.Average().ToString("F1") : "N/A";
        return $"""

=== STUDENT HISTORY (use for improvement_tracking) ===
Level : {h.Level}
Avg   : {avg}
Known weaknesses:
{string.Join("\n", h.Weaknesses.Select(w => $"- {w}"))}
""";
    }

    private static string BuildJsonTemplate(string mode) => mode switch
    {
        "guide" => """
=== REQUIRED JSON (guide mode — no scores) ===
{
  "guide_mode": {
    "outline": {
      "introduction": ["point to cover 1", "point to cover 2"],
      "body":         ["main argument 1", "main argument 2", "main argument 3"],
      "conclusion":   ["restate thesis", "final thought"]
    },
    "sentence_suggestions": {
      "introduction": ["sentence starter 1", "sentence starter 2"],
      "body":         ["body sentence starter 1", "body sentence starter 2"],
      "conclusion":   ["conclusion starter"]
    }
  },
  "overall_score": null,
  "estimated_level": null,
  "task_relevance": null,
  "taskFulfilment": null, "organization": null,
  "vocabulary": null,     "grammar": null,
  "sentence_feedback": [], "improvement_tracking": {"improved":[],"not_improved":[],"new_issues":[]},
  "corrections": [], "inline_highlights": [],
  "recommended_structures": [], "rewrite_samples": [],
  "strengths_en": [], "strengths_vi": [],
  "improvements_en": [], "improvements_vi": [],
  "roadmap": null
}

GUIDE RULES:
- sentence_suggestions: STARTERS ONLY, NOT complete paragraphs
- NEVER write a full essay or complete body paragraph
- outline points must be specific to THIS topic
- match complexity to level: B1=simple, B2=complex, C1=sophisticated
""",

        "practice" => """
=== REQUIRED JSON (practice mode) ===
{
  "task_relevance": {
    "is_relevant": bool, "relevance_score": 0-10,
    "verdict_en": "", "verdict_vi": "",
    "missing_points_en": [], "missing_points_vi": [],
    "off_topic_sentences": []
  },
  "taskFulfilment": {"score":0-10,"evidence_en":"","feedback_en":"","feedback_vi":""},
  "organization":   {"score":0-10,"evidence_en":"","feedback_en":"","feedback_vi":""},
  "vocabulary":     {"score":0-10,"evidence_en":"","feedback_en":"","feedback_vi":""},
  "grammar":        {"score":0-10,"evidence_en":"","feedback_en":"","feedback_vi":""},
  "overall_score": 0.0,
  "estimated_level": "B1|B2|C1",
  "strengths_vi": ["top 2 only"],
  "improvements_vi": ["top 2 only — most impactful"],
  "improvements_en": [],
  "strengths_en": [],
  "sentence_feedback": [
    {"sentence":"","is_good":true,"issue_type":"grammar|vocab|coherence|task|none","explanation":"","suggestion":""}
  ],
  "improvement_tracking": {"improved":[],"not_improved":[],"new_issues":[]},
  "corrections": [],
  "inline_highlights": [],
  "recommended_structures": [],
  "rewrite_samples": [],
  "roadmap": null,
  "guide_mode": null
}

PRACTICE RULES:
- sentence_feedback: only flag sentences with SIGNIFICANT issues
- improvements_vi: MAX 2 items
- roadmap: null
""",

        _ => """
=== REQUIRED JSON (exam mode — full analysis) ===
{
  "task_relevance": {
    "is_relevant": bool, "relevance_score": 0-10,
    "verdict_en": "", "verdict_vi": "",
    "missing_points_en": [], "missing_points_vi": [],
    "off_topic_sentences": []
  },
  "taskFulfilment": {"score":0-10,"evidence_en":"","feedback_en":"","feedback_vi":""},
  "organization":   {"score":0-10,"evidence_en":"","feedback_en":"","feedback_vi":""},
  "vocabulary":     {"score":0-10,"evidence_en":"","feedback_en":"","feedback_vi":""},
  "grammar":        {"score":0-10,"evidence_en":"","feedback_en":"","feedback_vi":""},
  "overall_score": 0.0,
  "estimated_level": "B1|B2|C1",
  "strengths_en": [], "strengths_vi": [],
  "improvements_en": [], "improvements_vi": [],
  "sentence_feedback": [
    {
      "sentence":    "<VERBATIM_SENTENCE>",
      "is_good":     true|false,
      "issue_type":  "grammar|vocabulary|coherence|task|none",
      "explanation": "Why this sentence is good or weak",
      "suggestion":  "Improved version of this sentence"
    }
  ],
  "inline_sentence_improvement": [
    {
      "original":   "<VERBATIM>",
      "improved":   "Improved version",
      "reason":     "Explanation of changes"
    }
  ],
  "improvement_tracking": {
    "improved":     ["weakness from history no longer present"],
    "not_improved": ["weakness from history still present"],
    "new_issues":   ["new problem not in history"]
  },
  "corrections": [{"original":"","corrected":"","reason_en":"","reason_vi":""}],
  "inline_highlights": [
    {"type":"error|strength","quote":"<VERBATIM>","issue":"","issue_vi":"","fix":"","category":"grammar|vocabulary|organization|taskFulfilment"}
  ],
  "recommended_structures": [{"structure_name":"","example":"","why_use_it_vi":""}],
  "rewrite_samples": [{"original":"<VERBATIM>","rewritten":"","explanation_vi":""}],
  "roadmap": {
    "current_level":"","target_level":"","estimated_weeks":4-8,
    "weekly_plan":[{"week":1,"focus":"","tasks":[""],"goal":""}]
  },
  "guide_mode": null
}

- sentence_feedback: 
  * Analyze only meaningful, content-bearing sentences.
  * Skip all boilerplate (e.g., "[Your Name]", "[Your Position]", "[Company Name]", standard dates).
  * Skip greetings/closings unless they contain mistakes.
  * For each GOOD sentence: set is_good: true, give brief positive reinforcement.
  * For each WEAK sentence: set is_good: false, clearly explain why and suggest a better phrasing.
- improvement_tracking: Label issues as `improved`, `not_improved`, or `new_issues` compared to history.
- estimated_level: 
    * <4.0: Below B1
    * 4.0-5.5: Bậc 3 (B1)
    * 6.0-8.0: Bậc 4 (B2)
    * >=8.5: Bậc 5 (C1)
- inline_highlights: highlight at least 3 errors and at least 1 strength.
- rewrite_samples: 2 weakest content-bearing sentences.
- roadmap: Generate a dynamic, step-by-step 8-week plan based ONLY on this analysis.
- Important: Maintain original meaning when improving structure. Output must be strictly JSON.
- inline_highlights: min 3 errors + min 1 strength, quote MUST be verbatim
- rewrite_samples: 2 weakest sentences, original MUST be verbatim
- roadmap: max 8 weeks
"""
    };

    public async Task<Result<AiGradingOutput>> GradeAsync(
        string rubricContext, string taskType, string instruction,
        string[] keyPoints, int wordCount, string essayText,
        string mode = "exam", UserHistory? history = null,
        string language = "vi",
        CancellationToken ct = default)
    {
        var systemPrompt = BuildSystemPrompt(mode, language);
        var historyCtx   = BuildHistoryContext(history);
        var jsonTemplate = BuildJsonTemplate(mode);

        var userPrompt = $@"
=== VSTEP RUBRIC ===
{rubricContext}

=== EXAM PROMPT ===
Type       : {taskType}
Instruction: {instruction}
Key points :
{string.Join("\n", keyPoints.Select(p => "- " + p))}
{historyCtx}
=== STUDENT ESSAY ({wordCount} words) ===
{essayText}

{jsonTemplate}
";

        try
        {
            // Use a dedicated timeout (3 min) — don't use the HTTP request's CT,
            // so a browser disconnect doesn't cancel an in-flight Gemini call.
            using var aiCts = new CancellationTokenSource(TimeSpan.FromMinutes(3));
            var (rawJson, modelUsed) = await _client.GenerateAsync(systemPrompt, userPrompt, maxTokens: 16384, ct: aiCts.Token);
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
            Roadmap: rd != null ? new GradingRoadmap(
                rd.Current_Level,
                rd.Target_Level,
                rd.Estimated_Weeks,
                rd.Weekly_Plan.Select(wp =>
                    new WeeklyPlanTask(wp.Week, wp.Focus, wp.Tasks, wp.Goal)
                ).ToArray()
            ) : null,
            AiModel: raw.ModelUsed,

            SentenceFeedback: raw.Sentence_Feedback?.Select(s =>
                new Domain.ValueObjects.SentenceFeedback(
                    s.Sentence, s.Is_Good, s.Issue_Type,
                    s.Explanation, s.Suggestion
                )).ToArray() ?? [],

            ImprovementTracking: raw.Improvement_Tracking != null
                ? new Domain.ValueObjects.ImprovementTracking(
                    raw.Improvement_Tracking.Improved     ?? [],
                    raw.Improvement_Tracking.Not_Improved ?? [],
                    raw.Improvement_Tracking.New_Issues   ?? [])
                : null,

            GuideMode: raw.Guide_Mode != null
                ? new Domain.ValueObjects.GuideOutput(
                    new Domain.ValueObjects.GuideOutline(
                        raw.Guide_Mode.Outline.Introduction ?? [],
                        raw.Guide_Mode.Outline.Body ?? [],
                        raw.Guide_Mode.Outline.Conclusion ?? []),
                    new Domain.ValueObjects.GuideSentenceSuggestions(
                        raw.Guide_Mode.Sentence_Suggestions.Introduction ?? [],
                        raw.Guide_Mode.Sentence_Suggestions.Body ?? [],
                        raw.Guide_Mode.Sentence_Suggestions.Conclusion ?? []))
                : null
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

    [System.Text.Json.Serialization.JsonPropertyName("sentence_feedback")]
    public RawSentenceFeedback[]? Sentence_Feedback { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("inline_sentence_improvement")]
    public RawRewrite[] Inline_Sentence_Improvement { get; set; } = [];

    [System.Text.Json.Serialization.JsonPropertyName("improvement_tracking")]
    public RawImprovementTracking? Improvement_Tracking { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("guide_mode")]
    public RawGuideMode? Guide_Mode { get; set; }

    public string ModelUsed { get; set; } = "";
}

internal record RawSentenceFeedback(
    string Sentence, 
    [property: System.Text.Json.Serialization.JsonPropertyName("is_good")] bool Is_Good,
    [property: System.Text.Json.Serialization.JsonPropertyName("issue_type")] string Issue_Type, 
    string Explanation, string Suggestion
);

internal record RawImprovementTracking(
    string[] Improved, 
    [property: System.Text.Json.Serialization.JsonPropertyName("not_improved")] string[] Not_Improved, 
    [property: System.Text.Json.Serialization.JsonPropertyName("new_issues")] string[] New_Issues
);

internal record RawGuideOutline(
    string[] Introduction, string[] Body, string[] Conclusion
);

internal record RawGuideSentenceSuggestions(
    string[] Introduction, string[] Body, string[] Conclusion
);

internal record RawGuideMode(
    RawGuideOutline Outline,
    [property: System.Text.Json.Serialization.JsonPropertyName("sentence_suggestions")] RawGuideSentenceSuggestions Sentence_Suggestions
);

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

