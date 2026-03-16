using Google.Cloud.Firestore;
using VstepWritingLab.Shared.Models.Entities;
using VstepWritingLab.Data.Repositories.Base;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace VstepWritingLab.Data.Repositories
{
    public class QuestionRepository : BaseRepository<QuestionModel>
    {
        public QuestionRepository(FirestoreDb db)
            : base(db, "questions") { }

        public async Task<List<QuestionModel>> GetActiveAsync(
            string? taskType = null,
            string? level = null)
        {
            Query query = Collection.WhereEqualTo("IsActive", true);

            if (!string.IsNullOrEmpty(taskType))
                query = query.WhereEqualTo("TaskType", taskType);

            if (!string.IsNullOrEmpty(level))
                query = query.WhereEqualTo("Level", level);

            var snapshot = await query.GetSnapshotAsync();
            return snapshot.Documents
                .Select(d => d.ConvertTo<QuestionModel>())
                .ToList();
        }
    }
}
