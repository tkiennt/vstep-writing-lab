using VstepWritingLab.Domain.ValueObjects;
using VstepWritingLab.Domain.Entities;

namespace VstepWritingLab.Business.DTOs;

public record GradeEssayRequest(
    string EssayId,
    string TaskType,
    string Prompt,      // full exam instruction
    string EssayText,
    int    WordCount
);

public record GradeEssayCommand(
    string StudentId,
    string EssayId,
    string TaskType,
    string Prompt,
    string EssayText,
    int    WordCount
);

public record FullAnalysisResponse(
    string Id,
    string StudentId,
    string ExamId,
    string TaskType,
    DateTime GradedAt,
    double TotalScore,
    string CefrLevel,
    string VstepComparison,
    TaskRelevance Relevance,
    CriterionScore TaskFulfilment,
    CriterionScore Organization,
    CriterionScore Vocabulary,
    CriterionScore Grammar,
    string[] StrengthsVi,
    string[] ImprovementsVi,
    Correction[] Corrections,
    InlineHighlight[] InlineHighlights,
    RecommendedStructure[] RecommendedStructures,
    RewriteSample[] RewriteSamples,
    GradingRoadmap Roadmap,
    string ModelUsed
);
