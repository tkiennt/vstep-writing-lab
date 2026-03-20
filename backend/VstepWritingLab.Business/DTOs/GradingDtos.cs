using VstepWritingLab.Domain.ValueObjects;
using VstepWritingLab.Domain.Entities;

namespace VstepWritingLab.Business.DTOs;

public record GradeEssayRequest(
    string UserUid,
    string PromptId,
    string Content,
    string TaskType
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
