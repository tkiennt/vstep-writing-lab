using VstepWritingLab.Business.DTOs;
using VstepWritingLab.Domain.Entities;

namespace VstepWritingLab.Business.Events;

/// <summary>
/// Message published to RabbitMQ when an essay is queued for AI grading.
/// </summary>
public record GradeEssayMessage(
    string ResultId,
    GradeEssayCommand Command,
    ExamPrompt         Exam,
    string             RubricContext
);
