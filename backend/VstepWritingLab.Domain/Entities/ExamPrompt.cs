using VstepWritingLab.Domain.ValueObjects;

namespace VstepWritingLab.Domain.Entities;

public class ExamPrompt
{
    public string   Id            { get; set; } = string.Empty;
    public string   TaskType      { get; private set; } = string.Empty; // "task1"|"task2"
    public string   CefrLevel     { get; private set; } = string.Empty; // "B1"|"B2"|"C1"
    public string   Instruction   { get; private set; } = string.Empty;
    public string[] KeyPoints     { get; private set; } = Array.Empty<string>();
    public string   TopicCategory { get; private set; } = string.Empty;
    public string   TopicKeyword  { get; private set; } = string.Empty;
    public string   EssayType     { get; private set; } = string.Empty;
    public int      Difficulty    { get; private set; } // 1|2|3
    public bool     IsActive      { get; private set; }
    public string[] SuggestedChecklist { get; private set; } = Array.Empty<string>();
    public string[] SuggestedPhrases   { get; private set; } = Array.Empty<string>();
    public string[] SuggestedStructures { get; private set; } = Array.Empty<string>();
    public int      UsageCount         { get; private set; }
    public DateTime CreatedAt          { get; private set; }

    public ExamPrompt() { } // For deserialization

    /// <summary>
    /// Reconstitutes an ExamPrompt from persistence (bypasses domain validation).
    /// Use ONLY when reading from the database.
    /// </summary>
    public static ExamPrompt Reconstitute(
        string id, string taskType, string cefrLevel, string instruction,
        string[] keyPoints, string topicCategory, string topicKeyword,
        string essayType, int difficulty, bool isActive, int usageCount,
        DateTime createdAt, string[] checklist, string[] phrases, string[] structures) => new()
    {
        Id = id,
        TaskType = taskType,
        CefrLevel = cefrLevel,
        Instruction = instruction,
        KeyPoints = keyPoints ?? Array.Empty<string>(),
        TopicCategory = topicCategory ?? string.Empty,
        TopicKeyword = topicKeyword ?? string.Empty,
        EssayType = essayType ?? string.Empty,
        Difficulty = Math.Clamp(difficulty, 0, 3),
        IsActive = isActive,
        UsageCount = usageCount,
        CreatedAt = createdAt,
        SuggestedChecklist = checklist ?? Array.Empty<string>(),
        SuggestedPhrases = phrases ?? Array.Empty<string>(),
        SuggestedStructures = structures ?? Array.Empty<string>(),
    };

    public static Result<ExamPrompt> Create(
        string taskType, string cefrLevel, string instruction,
        string[] keyPoints, string topicCategory, string topicKeyword,
        string essayType, int difficulty)
    {
        // Normalize: accept "Task1", "task1", "Task 1", etc.
        var normalizedTask = (taskType ?? "").ToLowerInvariant().Replace(" ", "");
        if (normalizedTask is not ("task1" or "task2"))
            return Result<ExamPrompt>.Fail($"TaskType '{taskType}' must be 'task1' or 'task2'");
        
        // Normalize CEFR level: accept "b1", "b2", "c1"
        var normalizedCefr = (cefrLevel ?? "").ToUpperInvariant().Trim();
        if (normalizedCefr is not ("B1" or "B2" or "C1"))
            normalizedCefr = "B1"; // Safe fallback instead of hard fail
        
        if (string.IsNullOrWhiteSpace(instruction))
            return Result<ExamPrompt>.Fail("Instruction is required");
        
        // Clamp difficulty instead of hard failing
        difficulty = Math.Clamp(difficulty, 1, 3);
        
        taskType = normalizedTask;
        cefrLevel = normalizedCefr;

        return Result<ExamPrompt>.Ok(new ExamPrompt {
            Id = string.Empty, // Will be overwritten by Firestore document ID
            TaskType = taskType, CefrLevel = cefrLevel,
            Instruction = instruction, KeyPoints = keyPoints ?? Array.Empty<string>(),
            TopicCategory = topicCategory ?? string.Empty,
            TopicKeyword = topicKeyword ?? string.Empty,
            EssayType = essayType ?? string.Empty, Difficulty = difficulty,
            SuggestedChecklist = Array.Empty<string>(),
            SuggestedPhrases = Array.Empty<string>(),
            SuggestedStructures = Array.Empty<string>(),
            IsActive = true, UsageCount = 0, CreatedAt = DateTime.UtcNow
        });
    }
}
