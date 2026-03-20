using Google.Cloud.Firestore;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using VstepWritingLab.Domain.Entities;
using VstepWritingLab.Domain.Interfaces;
using VstepWritingLab.Data.PersistenceModels;

namespace VstepWritingLab.Data.Repositories;

public class FirestoreExamSessionRepository(FirestoreDb db) : IExamSessionRepository
{
    private readonly CollectionReference _collection = db.Collection("exam_sessions");

    public async Task<ExamSession?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        var doc = await _collection.Document(id).GetSnapshotAsync(ct);
        return doc.Exists ? doc.ConvertTo<ExamSessionDocument>().ToDomain() : null;
    }

    public async Task<ExamSession?> GetActiveSessionAsync(string userId, string examId, CancellationToken ct = default)
    {
        var query = _collection
            .WhereEqualTo("userId", userId)
            .WhereEqualTo("examId", examId)
            .WhereEqualTo("status", ExamSessionStatus.InProgress.ToString())
            .Limit(1);

        var snap = await query.GetSnapshotAsync(ct);
        var doc = snap.Documents.FirstOrDefault();
        return doc != null ? doc.ConvertTo<ExamSessionDocument>().ToDomain() : null;
    }

    public async Task<string> CreateAsync(ExamSession session, CancellationToken ct = default)
    {
        var doc = await _collection.AddAsync(ExamSessionDocument.FromDomain(session), ct);
        return doc.Id;
    }

    public async Task UpdateAsync(ExamSession session, CancellationToken ct = default)
    {
        var doc = _collection.Document(session.Id);
        await doc.SetAsync(ExamSessionDocument.FromDomain(session), SetOptions.Overwrite, ct);
    }
}
