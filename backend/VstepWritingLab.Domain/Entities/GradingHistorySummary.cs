namespace VstepWritingLab.Domain.Entities;

/// <summary>Lightweight row for grading history lists (Firestore grading_results).</summary>
public record GradingHistorySummary(
    string Id,
    string ExamId,
    string TaskType,
    DateTime GradedAt,
    double TotalScore,
    string CefrLevel,
    int WordCount);
