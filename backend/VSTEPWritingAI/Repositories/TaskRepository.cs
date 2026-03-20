using Google.Cloud.Firestore;
using VSTEPWritingAI.Models.Firestore;
using VSTEPWritingAI.Repositories.Base;

namespace VSTEPWritingAI.Repositories
{
    public class TaskRepository : BaseRepository<TaskModel>
    {
        public TaskRepository(FirestoreDb db)
            : base(db, "tasks") { }

        // Document IDs are "task1" and "task2" — use GetByIdAsync("task1") directly
    }
}
