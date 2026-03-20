using Google.Cloud.Firestore;

namespace VSTEPWritingAI.Models.Firestore
{
    [FirestoreData]
    public class AiUsageLogModel
    {
        [FirestoreDocumentId]
        public string LogId { get; set; }

        [FirestoreProperty] public string SubmissionId { get; set; }
        // ref → submissions collection

        [FirestoreProperty] public string UserId { get; set; }
        // ref → users collection

        [FirestoreProperty] public string Model { get; set; }
        // e.g. "gemini-2.5-flash"

        [FirestoreProperty] public int PromptTokens { get; set; }
        [FirestoreProperty] public int CompletionTokens { get; set; }
        [FirestoreProperty] public int TotalTokens { get; set; }

        [FirestoreProperty] public int LatencyMs { get; set; }
        // Time in milliseconds for AI API to respond

        [FirestoreProperty] public string Status { get; set; }
        // "success" | "error"

        [FirestoreProperty] public string ErrorMessage { get; set; }
        // null when status = "success"

        [FirestoreProperty] public Timestamp CreatedAt { get; set; }
    }
}
