using VstepWritingLab.Business.Interfaces;
using Google.Cloud.Firestore;
using VstepWritingLab.Shared.Models.Entities;
using VstepWritingLab.Data.Repositories.Base;

namespace VstepWritingLab.Data.Repositories;

public class ProgressRepository(FirestoreDb db) : BaseRepository<ProgressModel>(db, "users"), ILegacyProgressRepository
{
    private DocumentReference GetSummaryRef(string userId) =>
        _db.Collection("users").Document(userId).Collection("progress").Document("summary");

    public new async Task<ProgressModel?> GetByIdAsync(string userId, CancellationToken ct = default)
    {
        var snap = await GetSummaryRef(userId).GetSnapshotAsync(ct);
        return snap.Exists ? snap.ConvertTo<ProgressModel>() : null;
    }

    public new async Task SetAsync(string userId, ProgressModel model, CancellationToken ct = default)
    {
        await GetSummaryRef(userId).SetAsync(model, SetOptions.MergeAll, ct);
    }
}
