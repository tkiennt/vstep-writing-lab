using VstepWritingLab.Business.Interfaces;
using Google.Cloud.Firestore;
using VstepWritingLab.Shared.Models.Entities;
using VstepWritingLab.Data.Repositories.Base;

namespace VstepWritingLab.Data.Repositories;

public class TaskRepository(FirestoreDb db) : BaseRepository<TaskModel>(db, "tasks"), ITaskRepository
{
}
