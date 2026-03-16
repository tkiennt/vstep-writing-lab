using Google.Cloud.Firestore;
using VstepWritingLab.Shared.Models.Entities;
using VstepWritingLab.Data.Repositories.Base;

namespace VstepWritingLab.Data.Repositories
{
    public class TaskRepository : BaseRepository<TaskModel>
    {
        public TaskRepository(FirestoreDb db)
            : base(db, "tasks") { }

        // Document IDs are "task1" and "task2" — use GetByIdAsync("task1") directly
    }
}
