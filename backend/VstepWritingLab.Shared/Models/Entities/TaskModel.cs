using Google.Cloud.Firestore;

namespace VstepWritingLab.Shared.Models.Entities
{
    [FirestoreData]
    public class TaskModel
    {
        [FirestoreDocumentId]
        public string TaskId { get; set; }
        // "task1" | "task2"

        [FirestoreProperty] public string Name { get; set; }
        // "Letter / Email Writing" | "Essay Writing"

        [FirestoreProperty] public string Type { get; set; }
        // "task1" | "task2"

        [FirestoreProperty] public int Duration { get; set; }
        // Task 1 = 20 minutes, Task 2 = 40 minutes

        [FirestoreProperty] public int MinWords { get; set; }
        // Task 1 = 120, Task 2 = 250

        [FirestoreProperty] public int? MaxWords { get; set; }
        // null — VSTEP has no upper word limit

        [FirestoreProperty] public double ScoreWeight { get; set; }
        // Task 1 = 0.333 (1/3), Task 2 = 0.667 (2/3)

        [FirestoreProperty] public string Description { get; set; }
        [FirestoreProperty] public bool IsActive { get; set; }
    }
}
