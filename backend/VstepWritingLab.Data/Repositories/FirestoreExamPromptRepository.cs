using Google.Cloud.Firestore;
using VstepWritingLab.Domain.Entities;
using VstepWritingLab.Domain.Interfaces;
using VstepWritingLab.Data.PersistenceModels;

namespace VstepWritingLab.Data.Repositories;

public class FirestoreExamPromptRepository(FirestoreDb db) : IExamPromptRepository
{
    private readonly CollectionReference _collection = db.Collection("exam_prompts");

    public async Task<ExamPrompt?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        var doc = await _collection.Document(id).GetSnapshotAsync(ct);
        return doc.Exists ? doc.ConvertTo<ExamPromptDocument>().ToDomain() : null;
    }

    public async Task<IReadOnlyList<ExamPrompt>> GetActiveAsync(
        string? taskType = null, string? cefrLevel = null,
        int? difficulty = null, int limit = 20, CancellationToken ct = default)
    {
        Query query = _collection.WhereEqualTo("isActive", true);
        if (taskType != null) query = query.WhereEqualTo("taskType", taskType);
        if (cefrLevel != null) query = query.WhereEqualTo("cefrLevel", cefrLevel);
        if (difficulty != null) query = query.WhereEqualTo("difficulty", difficulty);

        var snapshot = await query.Limit(limit).GetSnapshotAsync(ct);
        return snapshot.Documents.Select(d => d.ConvertTo<ExamPromptDocument>().ToDomain()).ToList();
    }

    public async Task<string> CreateAsync(ExamPrompt prompt, CancellationToken ct = default)
    {
        var doc = await _collection.AddAsync(ExamPromptDocument.FromDomain(prompt), ct);
        return doc.Id;
    }

    public async Task UpdateAsync(string id, Dictionary<string, object> updates, CancellationToken ct = default)
    {
        await _collection.Document(id).UpdateAsync(updates, cancellationToken: ct);
    }

    public async Task IncrementUsageAsync(string id, CancellationToken ct = default)
    {
        await _collection.Document(id).UpdateAsync("usageCount", FieldValue.Increment(1), cancellationToken: ct);
    }
}
