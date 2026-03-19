using VstepWritingLab.Business.Interfaces;
using Google.Cloud.Firestore;
using VstepWritingLab.Shared.Models.Entities;
using VstepWritingLab.Data.Repositories.Base;

namespace VstepWritingLab.Data.Repositories;

public class SentenceTemplateRepository(FirestoreDb db) : BaseRepository<SentenceTemplateModel>(db, "sentenceTemplates"), ISentenceTemplateRepository
{
    public async Task<List<SentenceTemplateModel>> GetByCategoryAsync(
        string taskType,
        string category,
        CancellationToken ct = default)
    {
        var query = Collection
            .WhereEqualTo("TaskType", taskType)
            .WhereEqualTo("Category", category)
            .WhereEqualTo("IsActive", true);

        var snapshot = await query.GetSnapshotAsync(ct);
        return snapshot.Documents
            .Select(d => d.ConvertTo<SentenceTemplateModel>())
            .ToList();
    }
}
