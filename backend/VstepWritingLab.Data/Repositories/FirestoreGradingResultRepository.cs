using Google.Cloud.Firestore;
using VstepWritingLab.Domain.Entities;
using VstepWritingLab.Domain.Interfaces;
using VstepWritingLab.Domain.ValueObjects;
using VstepWritingLab.Data.PersistenceModels;

namespace VstepWritingLab.Data.Repositories;

public class FirestoreGradingResultRepository(FirestoreDb _db) : IGradingResultRepository
{
    private const string COLLECTION = "grading_results";

    public async Task<string> SaveAsync(GradingResult result, CancellationToken ct = default)
    {
        var doc = GradingResultDocument.FromDomain(result);
        await _db.Collection(COLLECTION).Document(result.Id).SetAsync(doc, cancellationToken: ct);
        return result.Id;
    }

    public async Task<GradingResult?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        var snapshot = await _db.Collection(COLLECTION).Document(id).GetSnapshotAsync(ct);
        if (!snapshot.Exists) return null;
        
        var doc = snapshot.ConvertTo<GradingResultDocument>();
        return doc.ToDomain();
    }

    public async Task<IReadOnlyList<GradingResult>> GetHistoryAsync(
        string studentId, string? taskType = null, int limit = 20, CancellationToken ct = default)
    {
        var query = _db.Collection(COLLECTION)
            .WhereEqualTo("UserId", studentId);

        if (!string.IsNullOrEmpty(taskType))
            query = query.WhereEqualTo("TaskType", taskType);

        query = query.OrderByDescending("CreatedAt").Limit(limit);

        var snapshots = await query.GetSnapshotAsync(ct);
        return snapshots.Documents
            .Select(d => d.ConvertTo<GradingResultDocument>().ToDomain())
            .ToList();
    }

    public async Task UpdateStatusAsync(string id, string status, string? summary = null, CancellationToken ct = default)
    {
        var docRef = _db.Collection(COLLECTION).Document(id);
        var updates = new Dictionary<string, object> { ["Status"] = status };
        if (summary != null)
            updates["Summary"] = summary;
        await docRef.UpdateAsync(updates, cancellationToken: ct);
    }
}
