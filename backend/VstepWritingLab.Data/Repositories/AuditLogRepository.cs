using VstepWritingLab.Business.Interfaces;
using Google.Cloud.Firestore;
using VstepWritingLab.Shared.Models.Entities;
using VstepWritingLab.Data.Repositories.Base;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace VstepWritingLab.Data.Repositories;

public class AuditLogRepository(FirestoreDb db) : BaseRepository<AuditLogModel>(db, "audit_logs"), IAuditLogRepository
{
    async Task IAuditLogRepository.CreateAsync(AuditLogModel log, CancellationToken ct) => await base.CreateAsync(log, ct);

    public async Task<List<AuditLogModel>> GetRecentAsync(int count, CancellationToken ct = default)
    {
        var snapshot = await Collection.OrderByDescending("Timestamp").Limit(count).GetSnapshotAsync(ct);
        return snapshot.Documents.Select(d => d.ConvertTo<AuditLogModel>()).ToList();
    }
}
