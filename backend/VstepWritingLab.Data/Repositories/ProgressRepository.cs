using Google.Cloud.Firestore;
using VstepWritingLab.Shared.Models.Entities;
using VstepWritingLab.Data.Repositories.Base;
using System.Threading.Tasks;

namespace VstepWritingLab.Data.Repositories
{
    public class ProgressRepository : BaseRepository<ProgressModel>
    {
        public ProgressRepository(FirestoreDb db)
            : base(db, "progress") { }

        // Document ID = userId, so GetByIdAsync(userId) works directly
        // UpsertAsync: create if not exists, merge if exists

        public async Task UpsertAsync(ProgressModel model)
        {
            await Collection
                .Document(model.UserId)
                .SetAsync(model, SetOptions.MergeAll);
        }
    }
}
