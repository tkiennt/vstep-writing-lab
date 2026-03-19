using Google.Cloud.Firestore;
using VSTEPWritingAI.Models.Firestore;
using VSTEPWritingAI.Models.Common;
using VSTEPWritingAI.Repositories.Base;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace VSTEPWritingAI.Repositories
{
    public class SubmissionRepository : BaseRepository<SubmissionModel>
    {
        public SubmissionRepository(FirestoreDb db)
            : base(db, "submissions") { }

        public async Task<List<SubmissionModel>> GetByUserIdAsync(
            string userId,
            int limit = 20)
        {
            var query = Collection
                .WhereEqualTo("UserId", userId)
                .OrderByDescending("CreatedAt")
                .Limit(limit);

            var snapshot = await query.GetSnapshotAsync();
            return snapshot.Documents
                .Select(d => d.ConvertTo<SubmissionModel>())
                .ToList();
        }

        public async Task UpdateStatusAsync(
            string submissionId,
            string status,
            AiScoreModel? score = null,
            AiFeedbackModel? feedback = null)
        {
            var fields = new Dictionary<string, object>
            {
                { "Status", status },
                { "ScoredAt", Timestamp.GetCurrentTimestamp() }
            };

            if (score != null)    fields["AiScore"] = score;
            if (feedback != null) fields["AiFeedback"] = feedback;

            await Collection.Document(submissionId).UpdateAsync(fields);
        }

        public async Task<List<SubmissionModel>> SearchAsync(
            string? status = null,
            string? taskType = null,
            string? userId = null,
            DateTime? from = null,
            DateTime? to = null,
            int limit = 50)
        {
            Query query = Collection;

            if (!string.IsNullOrEmpty(status))
                query = query.WhereEqualTo("Status", status);
            
            if (!string.IsNullOrEmpty(taskType))
                query = query.WhereEqualTo("TaskType", taskType);
            
            if (!string.IsNullOrEmpty(userId))
                query = query.WhereEqualTo("UserId", userId);

            if (from.HasValue)
                query = query.WhereGreaterThanOrEqualTo("CreatedAt", Timestamp.FromDateTime(from.Value.ToUniversalTime()));
            
            if (to.HasValue)
                query = query.WhereLessThanOrEqualTo("CreatedAt", Timestamp.FromDateTime(to.Value.ToUniversalTime()));

            query = query.OrderByDescending("CreatedAt").Limit(limit);

            var snapshot = await query.GetSnapshotAsync();
            return snapshot.Documents
                .Select(d => d.ConvertTo<SubmissionModel>())
                .ToList();
        }
    }
}
