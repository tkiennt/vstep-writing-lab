using Google.Cloud.Firestore;
using VSTEPWritingAI.Models.Firestore;
using VSTEPWritingAI.Repositories.Base;
using System.Threading.Tasks;

namespace VSTEPWritingAI.Repositories
{
    public class RubricRepository : BaseRepository<RubricModel>
    {
        public RubricRepository(FirestoreDb db)
            : base(db, "rubrics") { }

        public async Task<RubricModel?> GetByTaskTypeAsync(string taskType)
        {
            // Document ID convention: "vstep_task1" | "vstep_task2"
            var id = $"vstep_{taskType}";
            return await GetByIdAsync(id);
        }
    }
}
