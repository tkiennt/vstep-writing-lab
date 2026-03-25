using VstepWritingLab.Domain.ValueObjects;

namespace VstepWritingLab.Domain.Interfaces;

public interface IGradingAiService
{
    Task<Result<AiGradingOutput>> GradeAsync(
        string rubricContext, string taskType, string instruction,
        string[] keyPoints, int wordCount, string essayText,
        string mode = "exam", UserHistory? history = null,
        string language = "vi",
        CancellationToken ct = default);

    Task<Result<AiGradingOutput>> GradePhase1Async(
        string rubricContext, string taskType, string instruction,
        string[] keyPoints, int wordCount, string essayText,
        string mode = "exam", UserHistory? history = null,
        string language = "vi",
        CancellationToken ct = default);

    Task<Result<AiGradingOutput>> GradePhase2Async(
        string rubricContext, string taskType, string instruction,
        string[] keyPoints, int wordCount, string essayText,
        string mode = "exam", UserHistory? history = null,
        string language = "vi",
        CancellationToken ct = default);

    Task<Result<AiGradingOutput>> TranslateAnalysisAsync(
        AiGradingOutput source,
        string targetLang = "vi",
        CancellationToken ct = default);
}

public interface IRubricContextService
{
    Task<string> GetContextAsync(
        string essayText, string taskType,
        CancellationToken ct = default);
}

// Support record for AI output
public record AiGradingOutput(
    TaskRelevance  Relevance,
    CriterionScore TaskFulfilment,
    CriterionScore Organization,
    CriterionScore Vocabulary,
    CriterionScore Grammar,
    string[]       StrengthsEn,
    string[]?      StrengthsVi,
    string[]       ImprovementsEn,
    string[]?      ImprovementsVi,
    Correction[]   Corrections,
    InlineHighlight[]      InlineHighlights,
    RecommendedStructure[] RecommendedStructures,
    RewriteSample[]        RewriteSamples,
    GradingRoadmap         Roadmap,
    string         AiModel,
    string         SummaryEn,
    string?        SummaryVi,
    SentenceFeedback[]?   SentenceFeedback,
    ImprovementTracking? ImprovementTracking,
    GuideOutput?         GuideMode
);
