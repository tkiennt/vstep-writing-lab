using VstepWritingLab.Business.Interfaces;
using Google.Cloud.Firestore;
using VstepWritingLab.Shared.Models.Entities;
using VstepWritingLab.Data.Repositories.Base;

namespace VstepWritingLab.Data.Repositories;

public class RubricRepository(FirestoreDb db) : BaseRepository<RubricModel>(db, "rubrics"), IRubricRepository
{
    public async Task<RubricModel?> GetByTaskTypeAsync(string taskType, CancellationToken ct = default)
    {
        var snapshot = await Collection.WhereEqualTo("TaskType", taskType).GetSnapshotAsync(ct);
        return snapshot.Documents.FirstOrDefault()?.ConvertTo<RubricModel>();
    }
}
