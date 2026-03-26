using Google.Cloud.Firestore;
using VstepWritingLab.Domain.Entities;

namespace VstepWritingLab.Data.PersistenceModels;

[FirestoreData]
public class ExamSessionDocument
{
    [FirestoreDocumentId] public string Id { get; set; } = string.Empty;
    [FirestoreProperty("userId")] public string UserId { get; set; } = string.Empty;
    [FirestoreProperty("examId")] public string ExamId { get; set; } = string.Empty;
    [FirestoreProperty("taskType")] public string TaskType { get; set; } = string.Empty;
    [FirestoreProperty("startTime")] public Timestamp StartTime { get; set; }
    [FirestoreProperty("lastUpdatedAt")] public Timestamp LastUpdatedAt { get; set; }
    [FirestoreProperty("essayText")] public string EssayText { get; set; } = string.Empty;
    [FirestoreProperty("status")] public string Status { get; set; } = string.Empty; // InProgress, Completed, TimedOut
    [FirestoreProperty("exitCount")] public int ExitCount { get; set; }

    public static ExamSessionDocument FromDomain(ExamSession domain) => new()
    {
        Id = domain.Id,
        UserId = domain.UserId,
        ExamId = domain.ExamId,
        TaskType = domain.TaskType,
        StartTime = Timestamp.FromDateTime(domain.StartTime.ToUniversalTime()),
        LastUpdatedAt = Timestamp.FromDateTime(domain.LastUpdatedAt.ToUniversalTime()),
        EssayText = domain.EssayText,
        Status = domain.Status.ToString(),
        ExitCount = domain.ExitCount
    };

    public ExamSession ToDomain() => new()
    {
        Id = Id,
        UserId = UserId,
        ExamId = ExamId,
        TaskType = TaskType,
        StartTime = StartTime.ToDateTime(),
        LastUpdatedAt = LastUpdatedAt.ToDateTime(),
        EssayText = EssayText,
        Status = Enum.TryParse<ExamSessionStatus>(Status, ignoreCase: true, out var parsedStatus)
                     ? parsedStatus
                     : ExamSessionStatus.InProgress,
        ExitCount = ExitCount
    };
}
