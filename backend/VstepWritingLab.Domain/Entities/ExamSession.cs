using System;

namespace VstepWritingLab.Domain.Entities;

public enum ExamSessionStatus
{
    InProgress,
    Completed,
    TimedOut
}

public class ExamSession
{
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string ExamId { get; set; } = string.Empty;
    public string TaskType { get; set; } = string.Empty; // "task1" | "task2"
    public DateTime StartTime { get; set; }
    public DateTime LastUpdatedAt { get; set; }
    public string EssayText { get; set; } = string.Empty;
    public ExamSessionStatus Status { get; set; }
    public int ExitCount { get; set; }
}
