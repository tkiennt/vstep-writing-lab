using Google.Cloud.Firestore;
using VSTEPWritingAI.Models.Firestore;
using VSTEPWritingAI.Repositories.Base;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace VSTEPWritingAI.Repositories
{
    public class SentenceTemplateRepository : BaseRepository<SentenceTemplateModel>
    {
        public SentenceTemplateRepository(FirestoreDb db)
            : base(db, "sentenceTemplates") { }

        public async Task<List<SentenceTemplateModel>> GetByCategoryAsync(
            string taskType,
            string category)
        {
            var query = Collection
                .WhereEqualTo("TaskType", taskType)
                .WhereEqualTo("Category", category)
                .WhereEqualTo("IsActive", true);

            var snapshot = await query.GetSnapshotAsync();
            return snapshot.Documents
                .Select(d => d.ConvertTo<SentenceTemplateModel>())
                .ToList();
        }
    }
}
