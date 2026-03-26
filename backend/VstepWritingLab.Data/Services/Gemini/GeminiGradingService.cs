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
IMPORTANT: Provide all feedback and suggestions strictly in ENGLISH.
Return ONLY valid JSON, no markdown.",

        "practice" => $@"
You are a VSTEP writing tutor from ULIS-VNU Hanoi.
Grade lightly — focus on 2 key improvements, keep feedback encouraging.
IMPORTANT: Provide all feedback and suggestions strictly in ENGLISH.
Return ONLY valid JSON, no markdown.",

        _ => $@"
You are an expert English writing tutor. Your task is to evaluate a student’s essay and provide structured feedback in ENGLISH. Follow these steps precisely:

1. Sentence Feedback: Analyze meaningful sentences, skip boilerplate/standard signatures. Mark good sentences as is_good:true. Provide clear explanation and suggestions for weak sentences.
2. Improvement Tracking: Compare with user history provided.
3. Estimated Level: Use the VSTEP scoring logic (4.0-5.5=Bậc 3, etc.).
4. Inline Highlights: Min 3 errors, min 1 strength.
5. Rewrite Samples: 2 weakest sentences.
6. Roadmap: Dynamic 8-week plan based on this specific essay analysis.

IMPORTANT: Provide all feedback (summary, explanations, suggestions, roadmap) strictly in ENGLISH.
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
    "verdict": "",
    "missing_points": [],
    "off_topic_sentences": []
  },
  "taskFulfilment": {"score":0-10,"evidence":"","feedback":""},
  "organization":   {"score":0-10,"evidence":"","feedback":""},
  "vocabulary":     {"score":0-10,"evidence":"","feedback":""},
  "grammar":        {"score":0-10,"evidence":"","feedback":""},
  "overall_score": 0.0,
  "estimated_level": "B1|B2|C1",
  "strengths_en": ["top 2 only"],
  "improvements_en": ["top 2 only — most impactful"],
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
- summary/feedback: provide strictly in ENGLISH
- roadmap: null
""",

        _ => """
=== REQUIRED JSON (exam mode — full analysis) ===
{
  "task_relevance": {
    "is_relevant": bool, "relevance_score": 0-10,
    "verdict": "",
    "missing_points": [],
    "off_topic_sentences": []
  },
  "taskFulfilment": {"score":0-10,"evidence":"","feedback":""},
  "organization":   {"score":0-10,"evidence":"","feedback":""},
  "vocabulary":     {"score":0-10,"evidence":"","feedback":""},
  "grammar":        {"score":0-10,"evidence":"","feedback":""},
  "overall_score": 0.0,
  "estimated_level": "B1|B2|C1",
  "strengths_en": [],
  "improvements_en": [],
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
  "corrections": [{"original":"","corrected":"","reason":""}],
  "inline_highlights": [
    {"type":"error|strength","quote":"<VERBATIM>","issue":"","fix":"","category":"grammar|vocabulary|organization|taskFulfilment"}
  ],
  "recommended_structures": [{"structure_name":"","example":"","why_use_it":""}],
  "rewrite_samples": [{"original":"<VERBATIM>","rewritten":"","explanation":""}],
  "roadmap": {
    "current_level":"","target_level":"","estimated_weeks":4-8,
    "weekly_plan":[{"week":1,"focus":"","tasks":[],"goal":""}]
  },
  "summary": "Overall evaluation of the essay in English",
  "guide_mode": null
}

- For each WEAK sentence: set is_good:false, clearly explain why and suggest a better phrasing.
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
            using var aiCts = new CancellationTokenSource(TimeSpan.FromMinutes(3));
            var (rawJson, modelUsed) = await _client.GenerateAsync(systemPrompt, userPrompt, maxTokens: 8192, ct: aiCts.Token);
            var parsed = ParseAiGradingOutput(rawJson, modelUsed);
            
            if (parsed == null)
            {
                return Result<AiGradingOutput>.Fail("Failed to parse AI response into valid JSON");
            }
            return Result<AiGradingOutput>.Ok(MapToDomainOutput(parsed));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Grading service failed");
            return Result<AiGradingOutput>.Fail(ex.Message);
        }
    }

    public async Task<Result<AiGradingOutput>> GradePhase1Async(
        string rubricContext, string taskType, string instruction,
        string[] keyPoints, int wordCount, string essayText,
        string mode = "exam", UserHistory? history = null,
        string language = "vi",
        CancellationToken ct = default)
    {
        var systemPrompt = mode switch
        {
            "guide" => BuildSystemPrompt(mode, language),
            _ => "You are a STRICT and CRITICAL English writing examiner. Your task is to provide a preliminary VSTEP score (0-10) for each criterion based on the provided rubric. DO NOT be generous. If an essay is off-topic or very short, give low scores. Return ONLY the JSON object. No preamble."
        };

        var historyCtx = BuildHistoryContext(history);
        var jsonTemplate = mode switch
        {
            "guide" => BuildJsonTemplate(mode),
            _ => """
=== REQUIRED JSON (PHASE 1 - SCORING ONLY) ===
{
  "task_relevance": {
    "is_relevant": true, "relevance_score": 0, "verdict": "", "missing_points": [], "off_topic_sentences": []
  },
  "taskFulfilment": {"score":0,"evidence":"","feedback":""},
  "organization":   {"score":0,"evidence":"","feedback":""},
  "vocabulary":     {"score":0,"evidence":"","feedback":""},
  "grammar":        {"score":0,"evidence":"","feedback":""},
  "overall_score": 0.0,
  "estimated_level": "B1|B2|C1",
  "summary": "Overall short evaluation in English",
  "strengths_en": [], "improvements_en": []
}
IMPORTANT: 
- 'score' fields MUST be integers.
- Return ONLY valid JSON matching this exact structure.
- Provide summary and feedbacks strictly in ENGLISH.
"""
        };

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
            using var aiCts = new CancellationTokenSource(TimeSpan.FromMinutes(2)); // Faster timeout for phase 1 but still enough
            var (rawJson, modelUsed) = await _client.GenerateAsync(systemPrompt, userPrompt, maxTokens: 8192, ct: aiCts.Token);
            var parsed = ParseAiGradingOutput(rawJson, modelUsed);
            
            if (parsed == null) return Result<AiGradingOutput>.Fail("Failed to parse AI Phase 1 response");
            return Result<AiGradingOutput>.Ok(MapToDomainOutput(parsed));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Phase 1 Grading failed");
            return Result<AiGradingOutput>.Fail(ex.Message);
        }
    }

    public async Task<Result<AiGradingOutput>> GradePhase2Async(
        string rubricContext, string taskType, string instruction,
        string[] keyPoints, int wordCount, string essayText,
        string mode = "exam", UserHistory? history = null,
        string language = "vi",
        CancellationToken ct = default)
    {
        if (mode == "guide") 
        {
            // Guide mode doesn't need Phase 2 processing
            return await GradeAsync(rubricContext, taskType, instruction, keyPoints, wordCount, essayText, mode, history, language, ct);
        }

        var systemPrompt = BuildSystemPrompt(mode, language);
        var historyCtx   = BuildHistoryContext(history);
        
        var jsonTemplate = """
=== REQUIRED JSON (PHASE 2 - DEEP ANALYSIS) ===
{
  "sentence_feedback": [{"sentence": "<VERBATIM>", "is_good": true|false, "issue_type": "grammar|vocabulary|coherence|task|none", "explanation": "", "suggestion": ""}],
  "improvement_tracking": {"improved": [], "not_improved": [], "new_issues": []},
  "corrections": [{"original": "", "corrected": "", "reason": ""}],
  "inline_highlights": [{"type": "error|strength", "quote": "<VERBATIM>", "issue": "", "fix": "", "category": "grammar|vocabulary|organization|taskFulfilment"}],
  "recommended_structures": [{"structure_name": "", "example": "", "why_use_it": ""}],
  "rewrite_samples": [{"original": "<VERBATIM>", "rewritten": "", "explanation": ""}],
  "roadmap": {
    "current_level": "", "target_level": "", "estimated_weeks": 4, 
    "weekly_plan": [{"week": 1, "focus": "", "tasks": [], "goal": ""}]
  }
}
RULES:
- Provide strictly in ENGLISH.
- sentence_feedback: Analyze max 10 most critical sentences. Do NOT analyze every single sentence to keep output short.
- inline_highlights: highlight at least 3 errors and at least 1 strength.
- Focus exclusively on sentence-by-sentence analysis, rewrite suggestions, and the roadmap.
- Return ONLY valid JSON structure matching the exact template above.
""";

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
            using var aiCts = new CancellationTokenSource(TimeSpan.FromMinutes(2));
            var (rawJson, modelUsed) = await _client.GenerateAsync(systemPrompt, userPrompt, maxTokens: 8192, ct: aiCts.Token);
            var parsed = ParseAiGradingOutput(rawJson, modelUsed);
            
            if (parsed == null) return Result<AiGradingOutput>.Fail("Failed to parse AI Phase 2 response");
            return Result<AiGradingOutput>.Ok(MapToDomainOutput(parsed));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Phase 2 Grading failed");
            return Result<AiGradingOutput>.Fail(ex.Message);
        }
    }

    private InternalAiOutput? ParseAiGradingOutput(string json, string modelUsed)
    {
        _logger.LogDebug("Raw AI JSON (first 500 chars): {Json}", json.Length > 500 ? json[..500] : json);
        try
        {
            // First pass: try standard extraction (most stable for normal responses)
            var startIndex = json.IndexOf('{');
            var lastIndex = json.LastIndexOf('}');
            
            string jsonToParse = json;
            if (startIndex >= 0 && lastIndex > startIndex)
            {
                jsonToParse = json.Substring(startIndex, lastIndex - startIndex + 1);
            }
            
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            try 
            {
                var output = JsonSerializer.Deserialize<InternalAiOutput>(jsonToParse, options);
                if (output != null) output.ModelUsed = modelUsed;
                return output;
            }
            catch (JsonException)
            {
                // Fallback: The JSON was truncated or malformed, attempt repair
                _logger.LogWarning("JSON truncation detected, attempting repair...");
                var repaired = JsonRepairHelper.RepairTruncatedJson(json);
                _logger.LogDebug("Repaired JSON (last 200 chars): {Json}", repaired.Length > 200 ? repaired[^200..] : repaired);
                
                var output = JsonSerializer.Deserialize<InternalAiOutput>(repaired, options);
                if (output != null) output.ModelUsed = $"{modelUsed} (repaired)";
                return output;
            }
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
                new[] { rel.Verdict_En ?? rel.Verdict ?? "" },
                (rel.Missing_Points_En ?? rel.Missing_Points ?? Array.Empty<string>()).ToArray(),
                rel.Off_Topic_Sentences ?? Array.Empty<string>()
            ),
            TaskFulfilment: new CriterionScore(
                tf.Score, CriterionScore.GetBandLabel(tf.Score),
                tf.Feedback_En ?? tf.Feedback ?? "", "", tf.Evidence_En ?? tf.Evidence ?? ""
            ),
            Organization: new CriterionScore(
                org.Score, CriterionScore.GetBandLabel(org.Score),
                org.Feedback_En ?? org.Feedback ?? "", "", org.Evidence_En ?? org.Evidence ?? ""
            ),
            Vocabulary: new CriterionScore(
                voc.Score, CriterionScore.GetBandLabel(voc.Score),
                voc.Feedback_En ?? voc.Feedback ?? "", "", voc.Evidence_En ?? voc.Evidence ?? ""
            ),
            Grammar: new CriterionScore(
                grm.Score, CriterionScore.GetBandLabel(grm.Score),
                grm.Feedback_En ?? grm.Feedback ?? "", "", grm.Evidence_En ?? grm.Evidence ?? ""
            ),
            StrengthsEn: raw.Strengths_En?.Length > 0 ? raw.Strengths_En : (raw.Strengths ?? Array.Empty<string>()),
            StrengthsVi: raw.Strengths_Vi,
            ImprovementsEn: raw.Improvements_En?.Length > 0 ? raw.Improvements_En : (raw.Improvements ?? Array.Empty<string>()),
            ImprovementsVi: raw.Improvements_Vi,
            Corrections: (raw.Corrections ?? Enumerable.Empty<RawCorrection>()).Select(c =>
                new Correction(c.Original, c.Corrected, c.Reason_En ?? c.Reason ?? "", c.Reason_Vi ?? "")
            ).ToArray(),
            InlineHighlights: (raw.Inline_Highlights ?? Enumerable.Empty<RawHighlight>()).Select(h =>
                new InlineHighlight(
                    h.Type, 
                    h.Quote, 
                    h.Issue_En ?? h.Issue ?? "", 
                    h.Issue_Vi ?? "", 
                    h.Fix_En ?? h.Fix ?? "", 
                    h.Fix_Vi ?? "", 
                    h.Category)
            ).ToArray(),
            RecommendedStructures: (raw.Recommended_Structures ?? Enumerable.Empty<RawStructure>()).Select(s =>
                new RecommendedStructure(s.Structure_Name, s.Example, s.Why_Use_It_En ?? s.Why_Use_It ?? "", s.Why_Use_It_Vi ?? "")
            ).ToArray(),
            RewriteSamples: (raw.Rewrite_Samples ?? Enumerable.Empty<RawRewrite>()).Select(r =>
                new RewriteSample(r.Original, r.Rewritten, r.Explanation_En ?? r.Explanation ?? "", r.Explanation_Vi ?? "")
            ).ToArray(),
            Roadmap: rd != null ? new GradingRoadmap(
                rd.Current_Level,
                rd.Target_Level,
                rd.Estimated_Weeks,
                rd.Weekly_Plan.Select(wp =>
                    new WeeklyPlanTask(wp.Week, wp.Focus, wp.Tasks, wp.Goal)
                ).ToArray()
            ) : null!,
            AiModel: raw.ModelUsed ?? "gemini-1.5-pro",
            SummaryEn: raw.Summary_En ?? raw.Explanation ?? raw.Summary ?? raw.Feedback ?? raw.Overall_Feedback ?? "",
            SummaryVi: raw.Summary_Vi ?? "",
            SentenceFeedback: (raw.Sentence_Feedback ?? Enumerable.Empty<RawSentenceFeedback>()).Select(f =>
                new SentenceFeedback(
                    f.Sentence, 
                    f.Is_Good, 
                    f.Issue_Type, 
                    f.Explanation_En ?? f.Explanation ?? "", 
                    f.Explanation_Vi ?? "", 
                    f.Suggestion_En ?? f.Suggestion ?? "", 
                    f.Suggestion_Vi ?? "")
            ).ToArray(),
            ImprovementTracking: raw.Improvement_Tracking != null
                ? new ImprovementTracking(
                    raw.Improvement_Tracking.Improved     ?? Array.Empty<string>(),
                    raw.Improvement_Tracking.Not_Improved ?? Array.Empty<string>(),
                    raw.Improvement_Tracking.New_Issues   ?? Array.Empty<string>())
                : null,
            GuideMode: raw.Guide_Mode != null
                ? new GuideOutput(
                    new GuideOutline(
                        raw.Guide_Mode.Outline.Introduction ?? Array.Empty<string>(),
                        raw.Guide_Mode.Outline.Body ?? Array.Empty<string>(),
                        raw.Guide_Mode.Outline.Conclusion ?? Array.Empty<string>()),
                    new GuideSentenceSuggestions(
                        raw.Guide_Mode.Sentence_Suggestions.Introduction ?? Array.Empty<string>(),
                        raw.Guide_Mode.Sentence_Suggestions.Body ?? Array.Empty<string>(),
                        raw.Guide_Mode.Sentence_Suggestions.Conclusion ?? Array.Empty<string>()))
                : null
        );
    }

    public async Task<Result<AiGradingOutput>> TranslateAnalysisAsync(
        AiGradingOutput source, 
        string targetLang = "vi",
        CancellationToken ct = default)
    {
        // Construct JSON using the same structure as InternalAiOutput so deserialization maps correctly
        var internalFormat = new 
        {
            summary_en = source.SummaryEn,
            summary_vi = "",
            strengths_en = source.StrengthsEn,
            strengths_vi = Array.Empty<string>(),
            improvements_en = source.ImprovementsEn,
            improvements_vi = Array.Empty<string>(),
            inline_highlights = source.InlineHighlights.Select(h => new {
                type = h.Type, quote = h.Quote, issue_en = h.IssueEn, issue_vi = "", fix_en = h.FixEn, fix_vi = ""
            }).ToArray(),
            sentence_feedback = source.SentenceFeedback.Select(s => new {
                sentence = s.Sentence, is_good = s.IsGood, issue_type = s.IssueType,
                explanation_en = s.ExplanationEn, explanation_vi = "", suggestion_en = s.SuggestionEn, suggestion_vi = ""
            }).ToArray()
        };

        var json = JsonSerializer.Serialize(internalFormat, new JsonSerializerOptions { WriteIndented = true });
        
        var systemPrompt = $@"
You are a professional translator and English writing coach.
Translate the following English feedback analysis JSON into Vietnamese.

RULES:
1. Translate all descriptive text, explanations, and suggestions from the '_en' fields into the corresponding empty '_vi' fields.
2. DO NOT translate verbatim quotes (e.g. the student's original sentences or 'quote' fields).
3. Preserve the exact JSON keys and structure.
4. Return ONLY valid JSON.
";
        var userPrompt = $@"TRANSLATE THIS ANALYSIS TO VIETNAMESE:
{json}";

        try
        {
            var (rawJson, modelUsed) = await _client.GenerateAsync(systemPrompt, userPrompt, maxTokens: 8192, ct: ct);
            var parsed = ParseAiGradingOutput(rawJson, modelUsed);
            
            if (parsed == null) return Result<AiGradingOutput>.Fail("Failed to parse translated AI response");
            
            // Map the translated values into the Vi fields of the Domain object
            return Result<AiGradingOutput>.Ok(MapToDomainOutput(parsed));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Translation failed");
            return Result<AiGradingOutput>.Fail(ex.Message);
        }
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

    [System.Text.Json.Serialization.JsonPropertyName("explanation")]
    public string Explanation { get; set; } = "";

    [System.Text.Json.Serialization.JsonPropertyName("suggestion")]
    public string Suggestion { get; set; } = "";

    [System.Text.Json.Serialization.JsonPropertyName("summary")]
    public string? Summary { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("feedback")]
    public string? Feedback { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("overall_feedback")]
    public string? Overall_Feedback { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("strengths")]
    public string[]? Strengths { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("improvements")]
    public string[]? Improvements { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("inline_sentence_improvement")]
    public RawRewrite[] Inline_Sentence_Improvement { get; set; } = [];

    [System.Text.Json.Serialization.JsonPropertyName("improvement_tracking")]
    public RawImprovementTracking? Improvement_Tracking { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("guide_mode")]
    public RawGuideMode? Guide_Mode { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("summary_en")]
    public string? Summary_En { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("summary_vi")]
    public string? Summary_Vi { get; set; }

    public string ModelUsed { get; set; } = "";
}

internal record RawSentenceFeedback(
    string Sentence, 
    [property: System.Text.Json.Serialization.JsonPropertyName("is_good")] bool Is_Good,
    [property: System.Text.Json.Serialization.JsonPropertyName("issue_type")] string Issue_Type, 
    [property: System.Text.Json.Serialization.JsonPropertyName("explanation_en")] string? Explanation_En,
    [property: System.Text.Json.Serialization.JsonPropertyName("explanation_vi")] string? Explanation_Vi,
    [property: System.Text.Json.Serialization.JsonPropertyName("suggestion_en")] string? Suggestion_En,
    [property: System.Text.Json.Serialization.JsonPropertyName("suggestion_vi")] string? Suggestion_Vi,
    [property: System.Text.Json.Serialization.JsonPropertyName("explanation")] string? Explanation,
    [property: System.Text.Json.Serialization.JsonPropertyName("suggestion")] string? Suggestion
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

    [System.Text.Json.Serialization.JsonPropertyName("verdict")]
    public string? Verdict { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("missing_points_en")]
    public string[] Missing_Points_En { get; set; } = [];

    [System.Text.Json.Serialization.JsonPropertyName("missing_points_vi")]
    public string[] Missing_Points_Vi { get; set; } = [];

    [System.Text.Json.Serialization.JsonPropertyName("missing_points")]
    public string[]? Missing_Points { get; set; }

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

    [System.Text.Json.Serialization.JsonPropertyName("feedback")]
    public string? Feedback { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("evidence")]
    public string? Evidence { get; set; }
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

    [System.Text.Json.Serialization.JsonPropertyName("reason")]
    public string? Reason { get; set; }
}

internal class RawHighlight
{
    [System.Text.Json.Serialization.JsonPropertyName("type")]
    public string Type { get; set; } = "";

    [System.Text.Json.Serialization.JsonPropertyName("quote")]
    public string Quote { get; set; } = "";

    [System.Text.Json.Serialization.JsonPropertyName("issue_en")]
    public string? Issue_En { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("issue_vi")]
    public string? Issue_Vi { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("issue")]
    public string? Issue { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("fix_en")]
    public string? Fix_En { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("fix_vi")]
    public string? Fix_Vi { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("fix")]
    public string? Fix { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("category")]
    public string Category { get; set; } = "";
}

internal class RawStructure
{
    [System.Text.Json.Serialization.JsonPropertyName("structure_name")]
    public string Structure_Name { get; set; } = "";

    [System.Text.Json.Serialization.JsonPropertyName("example")]
    public string Example { get; set; } = "";

    [System.Text.Json.Serialization.JsonPropertyName("why_use_it_en")]
    public string? Why_Use_It_En { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("why_use_it_vi")]
    public string? Why_Use_It_Vi { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("why_use_it")]
    public string? Why_Use_It { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("why")]
    public string? Why { get; set; }
}

internal class RawRewrite
{
    [System.Text.Json.Serialization.JsonPropertyName("original")]
    public string Original { get; set; } = "";

    [System.Text.Json.Serialization.JsonPropertyName("rewritten")]
    public string Rewritten { get; set; } = "";

    [System.Text.Json.Serialization.JsonPropertyName("explanation_en")]
    public string? Explanation_En { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("explanation_vi")]
    public string? Explanation_Vi { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("explanation")]
    public string? Explanation { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("reason")]
    public string? Reason { get; set; }
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

