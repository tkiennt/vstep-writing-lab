using VstepWritingLab.Business.DTOs;
using VstepWritingLab.Domain.Entities;

namespace VstepWritingLab.Business.Events;

/// <summary>
/// Phase 1: Immediate scores and summary.
/// </summary>
public record GradeEssayScoresMessage(
    string ResultId,
    GradeEssayCommand Command,
    ExamPrompt         Exam,
    string             RubricContext
);

/// <summary>
/// Phase 2: Detailed analysis, corrections, and roadmap.
/// </summary>
public record GradeEssayDetailsMessage(
    string ResultId,
    GradeEssayCommand Command,
    ExamPrompt         Exam,
    string             RubricContext
);
