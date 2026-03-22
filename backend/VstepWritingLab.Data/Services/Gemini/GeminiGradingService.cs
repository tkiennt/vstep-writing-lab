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
    ""current_level"":"""",""target_level"":"""",""estimated_weeks"": 6,
    ""weekly_plan"":[{{""week"":1,""focus"":"""",""tasks"":[""""],""goal"":""""}}]
  }}
}}

RULES:
- inline_highlights: min 3 errors + min 1 strength, quote MUST be verbatim
- rewrite_samples: 2 weakest sentences, original MUST be verbatim
- roadmap: estimated_weeks must be a single integer from 4 to 8 (weeks), not a range string
- tasks: specific (""practice gerund after 'look forward to'""), not vague (""study grammar"")
";

        const string compactRetryHint = @"

=== RETRY (shorter JSON — use if output was truncated) ===
Return the SAME schema. Keep feedback strings brief (under ~120 chars where possible).
inline_highlights: exactly 3 errors + 1 strength. improvements_* max 3 items each.
corrections max 4. recommended_structures max 2. rewrite_samples exactly 2.
roadmap.weekly_plan: at most 4 weeks; each tasks array max 2 strings.
";

        try
        {
            // Large JSON; models often cap output (~8k tokens) → truncation → invalid JSON. Retry with compact instructions.
            const int maxAttempts = 3;
            InternalAiOutput? parsed = null;

            for (var attempt = 0; attempt < maxAttempts; attempt++)
            {
                var prompt = attempt == 0 ? userPrompt : userPrompt + compactRetryHint;
                var maxTok = attempt == 0 ? 16384 : 8192;

                var gen = await _client.GenerateAsync(
                    SYSTEM_PROMPT, prompt, maxTokens: maxTok, temperature: 0.1f, ct: ct);

                if (gen.FinishReason is "MAX_TOKENS" or "OTHER")
                    _logger.LogWarning(
                        "Grading attempt {Attempt}/{Max}: finishReason={Reason}, textLen={Len}",
                        attempt + 1, maxAttempts, gen.FinishReason, gen.Text?.Length ?? 0);

                parsed = ParseAiGradingOutput(gen.Text ?? "", gen.ModelUsed);
                if (parsed != null)
                    break;

                _logger.LogWarning("Grading JSON parse failed attempt {Attempt}/{Max}", attempt + 1, maxAttempts);
                if (attempt + 1 < maxAttempts)
                    await Task.Delay(TimeSpan.FromMilliseconds(350 * (attempt + 1)), ct);
            }

            if (parsed == null)
            {
                return Result<AiGradingOutput>.Fail(
                    "Failed to parse AI response into valid JSON. Check API logs for the raw response; " +
                    "often caused by truncated output (retry) or Gemini key/quota.");
            }

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
        try
        {
            var extracted = GeminiJsonParsing.ExtractJsonObject(json);
            json = (extracted ?? json).Trim();
            if (string.IsNullOrEmpty(json))
                return null;

            var options = GeminiJsonParsing.CreateDeserializeOptions();
            var output = JsonSerializer.Deserialize<InternalAiOutput>(json, options);

            if (output != null)
                return output with { ModelUsed = modelUsed };
            return null;
        }
        catch (Exception ex)
        {
            var snippet = json.Length > 2000 ? json[..2000] + "…" : json;
            _logger.LogWarning(ex, "Failed to parse AI JSON response (len={Len}): {Snippet}", json?.Length ?? 0, snippet);
            return null;
        }
    }

    private AiGradingOutput MapToDomainOutput(InternalAiOutput raw)
    {
        var missEn = raw.Task_Relevance.Missing_Points_En ?? [];
        var missVi = raw.Task_Relevance.Missing_Points_Vi ?? [];
        return new AiGradingOutput(
            Relevance: new TaskRelevance(
                raw.Task_Relevance.Is_Relevant,
                raw.Task_Relevance.Relevance_Score,
                new[] { raw.Task_Relevance.Verdict_En, raw.Task_Relevance.Verdict_Vi },
                missEn.Concat(missVi).ToArray(),
                raw.Task_Relevance.Off_Topic_Sentences ?? []
            ),
            TaskFulfilment: new CriterionScore(
                raw.TaskFulfilment.Score,
                CriterionScore.GetBandLabel(raw.TaskFulfilment.Score),
                raw.TaskFulfilment.Feedback_En,
                raw.TaskFulfilment.Feedback_Vi,
                raw.TaskFulfilment.Evidence_En
            ),
            Organization: new CriterionScore(
                raw.Organization.Score,
                CriterionScore.GetBandLabel(raw.Organization.Score),
                raw.Organization.Feedback_En,
                raw.Organization.Feedback_Vi,
                raw.Organization.Evidence_En
            ),
            Vocabulary: new CriterionScore(
                raw.Vocabulary.Score,
                CriterionScore.GetBandLabel(raw.Vocabulary.Score),
                raw.Vocabulary.Feedback_En,
                raw.Vocabulary.Feedback_Vi,
                raw.Vocabulary.Evidence_En
            ),
            Grammar: new CriterionScore(
                raw.Grammar.Score,
                CriterionScore.GetBandLabel(raw.Grammar.Score),
                raw.Grammar.Feedback_En,
                raw.Grammar.Feedback_Vi,
                raw.Grammar.Evidence_En
            ),
            StrengthsVi: raw.Strengths_Vi ?? [],
            ImprovementsVi: raw.Improvements_Vi ?? [],
            Corrections: (raw.Corrections ?? []).Select(c => new Correction(
                c.Original, c.Corrected, c.Reason_En, c.Reason_Vi
            )).ToArray(),
            InlineHighlights: (raw.Inline_Highlights ?? []).Select(h => new InlineHighlight(
                h.Type, h.Quote, h.Issue, h.Issue_Vi, h.Fix, h.Category
            )).ToArray(),
            RecommendedStructures: (raw.Recommended_Structures ?? []).Select(s => new RecommendedStructure(
                s.Structure_Name, s.Example, s.Why_Use_It_Vi
            )).ToArray(),
            RewriteSamples: (raw.Rewrite_Samples ?? []).Select(r => new RewriteSample(
                r.Original, r.Rewritten, r.Explanation_Vi
            )).ToArray(),
            Roadmap: raw.Roadmap is null
                ? new GradingRoadmap("", "", 0, [])
                : new GradingRoadmap(
                    raw.Roadmap.Current_Level,
                    raw.Roadmap.Target_Level,
                    raw.Roadmap.Estimated_Weeks,
                    (raw.Roadmap.Weekly_Plan ?? []).Select(wp => new WeeklyPlanTask(
                        wp.Week, wp.Focus, wp.Tasks ?? [], wp.Goal
                    )).ToArray()
                ),
            AiModel: raw.ModelUsed
        );
    }
}

// ── Internal records for JSON mapping ───────────────────────────

internal record InternalAiOutput(
    InternalRelevance Task_Relevance,
    RawCriterion TaskFulfilment,
    RawCriterion Organization,
    RawCriterion Vocabulary,
    RawCriterion Grammar,
    string[]? Strengths_En,
    string[]? Strengths_Vi,
    string[]? Improvements_En,
    string[]? Improvements_Vi,
    RawCorrection[]? Corrections,
    RawHighlight[]? Inline_Highlights,
    RawStructure[]? Recommended_Structures,
    RawRewrite[]? Rewrite_Samples,
    RawRoadmap? Roadmap,
    string ModelUsed = ""
);

internal record InternalRelevance(
    bool Is_Relevant,
    int Relevance_Score,
    string Verdict_En,
    string Verdict_Vi,
    string[]? Missing_Points_En,
    string[]? Missing_Points_Vi,
    string[]? Off_Topic_Sentences
);

internal record RawCriterion(
    int Score,
    string Evidence_En,
    string Feedback_En,
    string Feedback_Vi
);

internal record RawCorrection(
    string Original,
    string Corrected,
    string Reason_En,
    string Reason_Vi
);

internal record RawHighlight(
    string Type,
    string Quote,
    string Issue,
    string Issue_Vi,
    string Fix,
    string Category
);

internal record RawStructure(
    string Structure_Name,
    string Example,
    string Why_Use_It_Vi
);

internal record RawRewrite(
    string Original,
    string Rewritten,
    string Explanation_Vi
);

internal record RawRoadmap(
    string Current_Level,
    string Target_Level,
    int Estimated_Weeks,
    RawWeeklyPlan[]? Weekly_Plan
);

internal record RawWeeklyPlan(
    int Week,
    string Focus,
    string[]? Tasks,
    string Goal
);
