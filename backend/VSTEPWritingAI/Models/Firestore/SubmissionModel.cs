using Google.Cloud.Firestore;
using VSTEPWritingAI.Models.Common;

namespace VSTEPWritingAI.Models.Firestore
{
    [FirestoreData]
    public class SubmissionModel
    {
        [FirestoreDocumentId]
        public string SubmissionId { get; set; }

        [FirestoreProperty] public string UserId { get; set; }
        // ref → users collection

        [FirestoreProperty] public string QuestionId { get; set; }
        // ref → questions collection

        [FirestoreProperty] public string TaskType { get; set; }
        // "task1" | "task2" — denormalized for easy querying

        [FirestoreProperty] public string Mode { get; set; }
        // "practice" | "guided"

        [FirestoreProperty] public string EssayContent { get; set; }
        // Full essay text submitted by student

        [FirestoreProperty] public int WordCount { get; set; }
        // Counted by backend before saving

        [FirestoreProperty] public bool BelowMinWords { get; set; }
        // true if WordCount < task minWords (120 for task1, 250 for task2)
        // AI still grades, but flag is stored for frontend to display warning

        [FirestoreProperty] public string Status { get; set; }
        // "pending"  — submitted, waiting for AI
        // "scored"   — AI graded successfully
        // "failed"   — AI call failed, retry available

        [FirestoreProperty] public AiScoreModel AiScore { get; set; }
        // null when status = "pending" or "failed"

        [FirestoreProperty] public AiFeedbackModel AiFeedback { get; set; }
        // null when status = "pending" or "failed"

        [FirestoreProperty] public int RetryCount { get; set; }
        // increments on each retry, max 3

        [FirestoreProperty] public Timestamp CreatedAt { get; set; }

        [FirestoreProperty] public Timestamp? ScoredAt { get; set; }
        // null until status = "scored"
    }
}
