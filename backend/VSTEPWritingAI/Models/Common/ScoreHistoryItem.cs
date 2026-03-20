using Google.Cloud.Firestore;

namespace VSTEPWritingAI.Models.Common
{
    [FirestoreData]
    public class ScoreHistoryItem
    {
        [FirestoreProperty] public string SubmissionId { get; set; }
        [FirestoreProperty] public double Score { get; set; }
        [FirestoreProperty] public string TaskType { get; set; }
        // "task1" | "task2"

        [FirestoreProperty] public string Date { get; set; }
        // Format: "yyyy-MM-dd"
    }
}
