using VstepWritingLab.Business.Interfaces;
using Google.Cloud.Firestore;
using VstepWritingLab.Shared.Models.Entities;
using VstepWritingLab.Data.Repositories.Base;

namespace VstepWritingLab.Data.Repositories;

public class QuestionRepository(FirestoreDb db) : BaseRepository<QuestionModel>(db, "questions"), IQuestionRepository
{
    public async Task<List<QuestionModel>> GetActiveAsync(
        string? taskType = null,
        string? level = null,
        CancellationToken ct = default)
    {
        Query query = Collection.WhereEqualTo("IsActive", true);

        if (!string.IsNullOrEmpty(taskType))
            query = query.WhereEqualTo("TaskType", taskType);

        if (!string.IsNullOrEmpty(level))
            query = query.WhereEqualTo("Level", level);

        var snapshot = await query.GetSnapshotAsync(ct);
        return snapshot.Documents
            .Select(d => d.ConvertTo<QuestionModel>())
            .ToList();
    }
}
