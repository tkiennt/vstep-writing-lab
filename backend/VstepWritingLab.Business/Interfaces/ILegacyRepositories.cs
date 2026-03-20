using VstepWritingLab.Shared.Models.Entities;
using VstepWritingLab.Shared.Models.Common;
using System.Threading;

namespace VstepWritingLab.Business.Interfaces;

public interface IRubricRepository
{
    Task<RubricModel?> GetByTaskTypeAsync(string taskType, CancellationToken ct = default);
    Task<List<RubricModel>> GetAllAsync(CancellationToken ct = default);
    Task<RubricModel?> GetByIdAsync(string id, CancellationToken ct = default);
}

public interface IAiUsageLogRepository
{
    Task CreateAsync(AiUsageLogModel log, CancellationToken ct = default);
    Task<long> GetTotalTokensAsync(DateTime from, DateTime to, CancellationToken ct = default);
    Task<List<AiUsageLogModel>> GetByDateRangeAsync(DateTime from, DateTime to, CancellationToken ct = default);
}

public interface IQuestionRepository
{
    Task<QuestionModel?> GetByIdAsync(string id, CancellationToken ct = default);
    Task<List<QuestionModel>> GetAllAsync(CancellationToken ct = default);
    Task<List<QuestionModel>> GetActiveAsync(string? taskType = null, string? level = null, CancellationToken ct = default);
    Task SetAsync(string id, QuestionModel question, CancellationToken ct = default);
    Task UpdateAsync(string id, Dictionary<string, object> updates, CancellationToken ct = default);
}

public interface ISubmissionRepository
{
    Task<SubmissionModel?> GetByIdAsync(string id, CancellationToken ct = default);
    Task<string> CreateAsync(SubmissionModel submission, CancellationToken ct = default);
    Task UpdateStatusAsync(string submissionId, string status, AiScoreModel? score = null, AiFeedbackModel? feedback = null, CancellationToken ct = default);
    Task UpdateAsync(string id, Dictionary<string, object> updates, CancellationToken ct = default);
    Task<List<SubmissionModel>> GetByUserIdAsync(string userId, int limit, CancellationToken ct = default);
    Task<List<SubmissionModel>> GetAllAsync(CancellationToken ct = default);
}

public interface ITaskRepository
{
    Task<TaskModel?> GetByIdAsync(string id, CancellationToken ct = default);
}

public interface ILegacyProgressRepository
{
    Task<ProgressModel?> GetByIdAsync(string userId, CancellationToken ct = default);
    Task SetAsync(string userId, ProgressModel progress, CancellationToken ct = default);
}

public interface ILegacyUserRepository
{
    Task<UserModel?> GetByIdAsync(string uid, CancellationToken ct = default);
    Task SetAsync(string uid, UserModel user, CancellationToken ct = default);
    Task<List<UserModel>> GetAllAsync(CancellationToken ct = default);
    Task UpdateAsync(string uid, Dictionary<string, object> updates, CancellationToken ct = default);
    Task DeleteAsync(string uid, CancellationToken ct = default);
}

public interface ISentenceTemplateRepository
{
    Task<List<SentenceTemplateModel>> GetAllAsync(CancellationToken ct = default);
    Task<List<SentenceTemplateModel>> GetByCategoryAsync(string taskType, string category, CancellationToken ct = default);
}
