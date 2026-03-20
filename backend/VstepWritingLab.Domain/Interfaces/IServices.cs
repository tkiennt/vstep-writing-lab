using VstepWritingLab.Domain.ValueObjects;

namespace VstepWritingLab.Domain.Interfaces;

public interface IGradingAiService
{
    Task<Result<AiGradingOutput>> GradeAsync(
        string rubricContext, string taskType, string instruction,
        string[] keyPoints, int wordCount, string essayText,
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
    string[]       StrengthsVi,
    string[]       ImprovementsVi,
    Correction[]   Corrections,
    InlineHighlight[]      InlineHighlights,
    RecommendedStructure[] RecommendedStructures,
    RewriteSample[]        RewriteSamples,
    GradingRoadmap         Roadmap,
    string         AiModel
);
