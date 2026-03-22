using Google.Cloud.Firestore;
using VstepWritingLab.Domain.Entities;
using VstepWritingLab.Domain.Interfaces;
using VstepWritingLab.Data.PersistenceModels;

namespace VstepWritingLab.Data.Repositories;

public class FirestoreGradingResultRepository(FirestoreDb _db) : IGradingResultRepository
{
    private const string COLLECTION = "grading_results";

    public async Task<string> SaveAsync(GradingResult result, string essayText, int wordCount, CancellationToken ct = default)
    {
        var doc = GradingResultDocument.FromDomain(result, essayText, wordCount);
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
            .WhereEqualTo("StudentId", studentId);

        if (!string.IsNullOrEmpty(taskType))
            query = query.WhereEqualTo("TaskType", taskType);

        query = query.OrderByDescending("GradedAt").Limit(limit);

        var snapshots = await query.GetSnapshotAsync(ct);
        return snapshots.Documents
            .Select(d => d.ConvertTo<GradingResultDocument>().ToDomain())
            .ToList();
    }

    public async Task<IReadOnlyList<GradingHistorySummary>> GetHistorySummariesAsync(
        string studentId, int limit = 30, CancellationToken ct = default)
    {
        var query = _db.Collection(COLLECTION)
            .WhereEqualTo("StudentId", studentId)
            .OrderByDescending("GradedAt")
            .Limit(limit);

        var snapshots = await query.GetSnapshotAsync(ct);
        return snapshots.Documents
            .Select(d =>
            {
                var doc = d.ConvertTo<GradingResultDocument>();
                return new GradingHistorySummary(
                    doc.Id,
                    doc.ExamId,
                    doc.TaskType,
                    doc.GradedAt,
                    doc.TotalScore,
                    doc.CefrLevel,
                    doc.WordCount);
            })
            .ToList();
    }

    public async Task<(GradingResult Result, string EssayText)?> GetWithEssayForStudentAsync(
        string studentId, string resultId, CancellationToken ct = default)
    {
        var snapshot = await _db.Collection(COLLECTION).Document(resultId).GetSnapshotAsync(ct);
        if (!snapshot.Exists) return null;

        var doc = snapshot.ConvertTo<GradingResultDocument>();
        if (doc.StudentId != studentId) return null;

        return (doc.ToDomain(), doc.EssayText ?? "");
    }
}
