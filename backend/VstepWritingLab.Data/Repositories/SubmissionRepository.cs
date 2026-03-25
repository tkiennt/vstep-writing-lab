using VstepWritingLab.Business.Interfaces;
using Google.Cloud.Firestore;
using VstepWritingLab.Shared.Models.Entities;
using VstepWritingLab.Shared.Models.Common;
using VstepWritingLab.Data.Repositories.Base;

namespace VstepWritingLab.Data.Repositories;

public class SubmissionRepository(FirestoreDb db) : BaseRepository<SubmissionModel>(db, "grading_results"), ISubmissionRepository
{
    public async Task UpdateStatusAsync(string submissionId, string status, AiScoreModel? score = null, AiFeedbackModel? feedback = null, CancellationToken ct = default)
    {
        var updates = new Dictionary<string, object> { { "Status", status } };
        if (score != null) updates["AiScore"] = score;
        if (feedback != null) updates["AiFeedback"] = feedback;
        await UpdateAsync(submissionId, updates, ct);
    }

    public async Task<long> CountByUserIdAsync(string userId, CancellationToken ct = default)
    {
        var query = Collection.WhereEqualTo("UserId", userId);
        var snapshot = await query.Count().GetSnapshotAsync(ct);
        return snapshot.Count ?? 0;
    }

    public async Task<List<SubmissionModel>> GetByUserIdAsync(string userId, int limit, CancellationToken ct = default)
    {
        // Many frontend queries use 'studentId' or 'userUid'. 
        // But our SubmissionModel uses 'UserId' with [FirestoreProperty].
        // Firestore default mapping for C# is PascalCase unless overridden.
        // I'll ensure we query for "UserId".
        var snapshot = await Collection.WhereEqualTo("UserId", userId).Limit(limit).GetSnapshotAsync(ct);
        return snapshot.Documents.Select(d => d.ConvertTo<SubmissionModel>()).ToList();
    }

    public override async Task DeleteAsync(string id, CancellationToken ct = default) => await base.DeleteAsync(id, ct);

    public override async Task<List<SubmissionModel>> GetAllAsync(CancellationToken ct = default) => await base.GetAllAsync(ct);
}
