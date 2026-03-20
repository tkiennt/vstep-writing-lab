using System;
using VstepWritingLab.Domain.Entities;

namespace VstepWritingLab.Business.DTOs;

public record StartSessionRequest(
    string ExamId,
    string TaskType
);

public record UpdateSessionRequest(
    string? EssayText = null,
    int? ExitCount = null,
    string? Status = null
);

public record ExamSessionDto(
    string Id,
    string UserId,
    string ExamId,
    string TaskType,
    DateTime StartTime,
    DateTime LastUpdatedAt,
    string EssayText,
    string Status,
    int ExitCount
);
