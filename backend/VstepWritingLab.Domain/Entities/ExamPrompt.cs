using VstepWritingLab.Domain.ValueObjects;

namespace VstepWritingLab.Domain.Entities;

public class ExamPrompt
{
    public string   Id            { get; private set; } = string.Empty;
    public string   TaskType      { get; private set; } = string.Empty; // "task1"|"task2"
    public string   CefrLevel     { get; private set; } = string.Empty; // "B1"|"B2"|"C1"
    public string   Instruction   { get; private set; } = string.Empty;
    public string[] KeyPoints     { get; private set; } = Array.Empty<string>();
    public string   TopicCategory { get; private set; } = string.Empty;
    public string   TopicKeyword  { get; private set; } = string.Empty;
    public string   EssayType     { get; private set; } = string.Empty;
    public int      Difficulty    { get; private set; } // 1|2|3
    public bool     IsActive      { get; private set; }
    public int      UsageCount    { get; private set; }
    public DateTime CreatedAt     { get; private set; }

    private ExamPrompt() { } // For deserialization

    /// <param name="documentId">
    /// Khi load từ Firestore phải truyền ID document; nếu null (tạo mới) sẽ dùng Guid.
    /// </param>
    public static Result<ExamPrompt> Create(
        string taskType, string cefrLevel, string instruction,
        string[] keyPoints, string topicCategory, string topicKeyword,
        string essayType, int difficulty,
        string? documentId = null,
        bool? isActive = null,
        int? usageCount = null,
        DateTime? createdAt = null)
    {
        if (taskType is not ("task1" or "task2"))
            return Result<ExamPrompt>.Fail("TaskType must be 'task1' or 'task2'");
        if (cefrLevel is not ("B1" or "B2" or "C1"))
            return Result<ExamPrompt>.Fail("CefrLevel must be B1, B2, or C1");
        if (string.IsNullOrWhiteSpace(instruction))
            return Result<ExamPrompt>.Fail("Instruction is required");
        if (difficulty is < 1 or > 3)
            return Result<ExamPrompt>.Fail("Difficulty must be 1, 2, or 3");

        var id = string.IsNullOrWhiteSpace(documentId)
            ? Guid.NewGuid().ToString()
            : documentId.Trim();

        return Result<ExamPrompt>.Ok(new ExamPrompt {
            Id = id,
            TaskType = taskType, CefrLevel = cefrLevel,
            Instruction = instruction, KeyPoints = keyPoints,
            TopicCategory = topicCategory, TopicKeyword = topicKeyword,
            EssayType = essayType, Difficulty = difficulty,
            IsActive = isActive ?? true,
            UsageCount = usageCount ?? 0,
            CreatedAt = createdAt ?? DateTime.UtcNow
        });
    }
}
