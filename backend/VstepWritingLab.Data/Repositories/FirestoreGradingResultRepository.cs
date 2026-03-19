using Google.Cloud.Firestore;
using VstepWritingLab.Domain.Entities;
using VstepWritingLab.Domain.Interfaces;

namespace VstepWritingLab.Data.Repositories;

public class FirestoreGradingResultRepository(FirestoreDb db) : IGradingResultRepository
{
    private readonly CollectionReference _collection = db.Collection("gradingResults");

    public async Task<string> SaveAsync(GradingResult result, string essayText, int wordCount, CancellationToken ct = default)
    {
        var doc = await _collection.AddAsync(new {
            result.Id, result.StudentId, result.ExamId, result.TaskType,
            result.GradedAt, result.TotalScore, result.CefrLevel,
            EssayText = essayText, WordCount = wordCount
        }, ct);
        return doc.Id;
    }

    public async Task<IReadOnlyList<GradingResult>> GetHistoryAsync(
        string studentId, string? taskType = null, int limit = 20, CancellationToken ct = default)
    {
        Query query = _collection.WhereEqualTo("StudentId", studentId);
        if (taskType != null) query = query.WhereEqualTo("TaskType", taskType);

        var snapshot = await query.Limit(limit).GetSnapshotAsync(ct);
        return snapshot.Documents.Select(d => d.ConvertTo<GradingResult>()).ToList();
    }

    public async Task<GradingResult?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        var doc = await _collection.Document(id).GetSnapshotAsync(ct);
        return doc.Exists ? doc.ConvertTo<GradingResult>() : null;
    }
}
