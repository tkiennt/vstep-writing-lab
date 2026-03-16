using Google.Cloud.Firestore;
using VstepWritingLab.Shared.Models.Entities;
using VstepWritingLab.Data.Repositories.Base;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace VstepWritingLab.Data.Repositories
{
    public class AiUsageLogRepository : BaseRepository<AiUsageLogModel>
    {
        public AiUsageLogRepository(FirestoreDb db)
            : base(db, "aiUsageLogs") { }

        // Append-only — only CreateAsync is used, never UpdateAsync or DeleteAsync

        public async Task<List<AiUsageLogModel>> GetByDateRangeAsync(
            DateTime from,
            DateTime to)
        {
            var query = Collection
                .WhereGreaterThanOrEqualTo("CreatedAt", Timestamp.FromDateTime(from.ToUniversalTime()))
                .WhereLessThanOrEqualTo("CreatedAt", Timestamp.FromDateTime(to.ToUniversalTime()))
                .OrderByDescending("CreatedAt");

            var snapshot = await query.GetSnapshotAsync();
            return snapshot.Documents
                .Select(d => d.ConvertTo<AiUsageLogModel>())
                .ToList();
        }

        public async Task<int> GetTotalTokensAsync(DateTime from, DateTime to)
        {
            var logs = await GetByDateRangeAsync(from, to);
            return logs.Sum(l => l.TotalTokens);
        }
    }
}
