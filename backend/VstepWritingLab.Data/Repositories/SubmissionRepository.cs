using Google.Cloud.Firestore;
using VstepWritingLab.Shared.Models.Entities;
using VstepWritingLab.Shared.Models.Common;
using VstepWritingLab.Data.Repositories.Base;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace VstepWritingLab.Data.Repositories
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
    }
}
