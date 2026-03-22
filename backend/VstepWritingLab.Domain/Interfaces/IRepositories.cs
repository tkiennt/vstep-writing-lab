using VstepWritingLab.Domain.Entities;
using VstepWritingLab.Domain.ValueObjects;

namespace VstepWritingLab.Domain.Interfaces;

public interface IExamPromptRepository
{
    Task<ExamPrompt?> GetByIdAsync(string id, CancellationToken ct = default);
    Task<IReadOnlyList<ExamPrompt>> GetActiveAsync(
        string? taskType = null, string? cefrLevel = null,
        int? difficulty = null, int limit = 20, CancellationToken ct = default);
    Task<string> CreateAsync(ExamPrompt prompt, CancellationToken ct = default);
    Task UpdateAsync(string id, Dictionary<string, object> updates, CancellationToken ct = default);
    Task IncrementUsageAsync(string id, CancellationToken ct = default);
}

public interface IGradingResultRepository
{
    Task<string> SaveAsync(GradingResult result, string essayText, int wordCount,
                           CancellationToken ct = default);
    Task<IReadOnlyList<GradingResult>> GetHistoryAsync(
        string studentId, string? taskType = null,
        int limit = 20, CancellationToken ct = default);
    Task<GradingResult?> GetByIdAsync(string id, CancellationToken ct = default);

    /// <summary>Ordered by GradedAt descending. Used for account history API.</summary>
    Task<IReadOnlyList<GradingHistorySummary>> GetHistorySummariesAsync(
        string studentId, int limit = 30, CancellationToken ct = default);

    /// <summary>Returns graded result + essay text if the document exists and belongs to the student.</summary>
    Task<(GradingResult Result, string EssayText)?> GetWithEssayForStudentAsync(
        string studentId, string resultId, CancellationToken ct = default);
}


public interface IProgressRepository
{
    Task<ProgressSummary?> GetAsync(string studentId, CancellationToken ct = default);
    Task SaveAsync(string studentId, ProgressSummary summary, CancellationToken ct = default);
}

public interface IUserRepository
{
    Task<User?> GetByIdAsync(string uid, CancellationToken ct = default);
    Task UpsertAsync(User user, CancellationToken ct = default);
}
