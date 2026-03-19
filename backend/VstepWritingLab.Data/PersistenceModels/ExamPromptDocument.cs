using Google.Cloud.Firestore;
using VstepWritingLab.Domain.Entities;

namespace VstepWritingLab.Data.PersistenceModels;

[FirestoreData]
public class ExamPromptDocument
{
    [FirestoreDocumentId] public string Id { get; set; } = string.Empty;
    [FirestoreProperty("taskType")] public string TaskType { get; set; } = string.Empty;
    [FirestoreProperty("cefrLevel")] public string CefrLevel { get; set; } = string.Empty;
    [FirestoreProperty("instruction")] public string Instruction { get; set; } = string.Empty;
    [FirestoreProperty("keyPoints")] public string[] KeyPoints { get; set; } = Array.Empty<string>();
    [FirestoreProperty("topicCategory")] public string TopicCategory { get; set; } = string.Empty;
    [FirestoreProperty("topicKeyword")] public string TopicKeyword { get; set; } = string.Empty;
    [FirestoreProperty("essayType")] public string EssayType { get; set; } = string.Empty;
    [FirestoreProperty("difficulty")] public int Difficulty { get; set; }
    [FirestoreProperty("isActive")] public bool IsActive { get; set; }
    [FirestoreProperty("usageCount")] public int UsageCount { get; set; }
    [FirestoreProperty("createdAt")] public Timestamp CreatedAt { get; set; }

    public static ExamPromptDocument FromDomain(ExamPrompt domain) => new()
    {
        Id = domain.Id,
        TaskType = domain.TaskType,
        CefrLevel = domain.CefrLevel,
        Instruction = domain.Instruction,
        KeyPoints = domain.KeyPoints,
        TopicCategory = domain.TopicCategory,
        TopicKeyword = domain.TopicKeyword,
        EssayType = domain.EssayType,
        Difficulty = domain.Difficulty,
        IsActive = domain.IsActive,
        UsageCount = domain.UsageCount,
        CreatedAt = Timestamp.FromDateTime(domain.CreatedAt.ToUniversalTime())
    };

    public ExamPrompt ToDomain()
    {
        var level = CefrLevel;
        if (string.IsNullOrEmpty(level))
        {
            level = Difficulty switch
            {
                1 => "B1",
                2 => "B2",
                3 => "C1",
                _ => "B1"
            };
        }

        var result = ExamPrompt.Create(
            TaskType, level, Instruction, KeyPoints, 
            TopicCategory, TopicKeyword, EssayType, Difficulty);
        
        return result.Value;
    }
}
