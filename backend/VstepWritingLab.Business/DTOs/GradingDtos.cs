using System;
using VstepWritingLab.Domain.ValueObjects;
using VstepWritingLab.Domain.Entities;

namespace VstepWritingLab.Business.DTOs;

public record UserHistoryRequest(
    string[] Weaknesses,    // ["subject-verb agreement", "article usage"]
    float[]  PastScores,    // [5.0, 5.5, 6.0]
    string   Level          // "B1" | "B2" | "C1"
);

public record GradeEssayRequest(
    string   EssayId,
    string   TaskType,
    string   Prompt,
    string   EssayText,
    int      WordCount,
    // NEW:
    string   Mode         = "exam",    // "exam" | "practice" | "guide"
    UserHistoryRequest? UserHistory = null
);

public record UserHistory(
    string[] Weaknesses,
    float[]  PastScores,
    string   Level
);

public record GradeEssayCommand(
    string   StudentId,
    string   EssayId,
    string   TaskType,
    string   Prompt,
    string   EssayText,
    int      WordCount,
    // NEW:
    string   Mode        = "exam",
    UserHistory? UserHistory = null
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
    string ModelUsed,
    // NEW:
    SentenceFeedback[]   SentenceFeedback,      // per-sentence analysis
    ImprovementTracking? ImprovementTracking,   // null if no user_history
    GuideOutput?         GuideMode,             // null unless mode=guide
    string               Mode                  // "exam"|"practice"|"guide"
);
