using VstepWritingLab.Business.Interfaces;
using Google.Cloud.Firestore;
using VstepWritingLab.Shared.Models.Entities;
using VstepWritingLab.Data.Repositories.Base;

namespace VstepWritingLab.Data.Repositories;

public class AiUsageLogRepository(FirestoreDb db) : BaseRepository<AiUsageLogModel>(db, "aiUsageLogs"), IAiUsageLogRepository
{
    async Task IAiUsageLogRepository.CreateAsync(AiUsageLogModel log, CancellationToken ct) => await base.CreateAsync(log, ct);

    public async Task<long> GetTotalTokensAsync(DateTime from, DateTime to, CancellationToken ct = default)
    {
        var snapshot = await Collection
            .WhereGreaterThanOrEqualTo("Timestamp", from)
            .WhereLessThanOrEqualTo("Timestamp", to)
            .GetSnapshotAsync(ct);

        return snapshot.Documents.Sum(d => d.GetValue<long>("TotalTokens"));
    }

    public async Task<List<AiUsageLogModel>> GetByDateRangeAsync(DateTime from, DateTime to, CancellationToken ct = default)
    {
        var snapshot = await Collection
            .WhereGreaterThanOrEqualTo("Timestamp", from)
            .WhereLessThanOrEqualTo("Timestamp", to)
            .GetSnapshotAsync(ct);

        return snapshot.Documents.Select(d => d.ConvertTo<AiUsageLogModel>()).ToList();
    }
}
