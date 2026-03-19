using Google.Cloud.Firestore;
using VstepWritingLab.Domain.Entities;
using VstepWritingLab.Domain.Interfaces;
using VstepWritingLab.Domain.ValueObjects;

namespace VstepWritingLab.Data.Repositories;

public class FirestoreProgressRepository(FirestoreDb db) : IProgressRepository
{
    private readonly CollectionReference _collection = db.Collection("userProgress");

    public async Task<ProgressSummary?> GetAsync(string studentId, CancellationToken ct = default)
    {
        var doc = await _collection.Document(studentId).GetSnapshotAsync(ct);
        return doc.Exists ? doc.ConvertTo<ProgressSummary>() : null;
    }

    public async Task SaveAsync(string studentId, ProgressSummary summary, CancellationToken ct = default)
    {
        await _collection.Document(studentId).SetAsync(summary, SetOptions.MergeAll, ct);
    }
}
