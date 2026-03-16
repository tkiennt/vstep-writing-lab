using Google.Cloud.Firestore;
using System.Collections.Generic;

namespace VstepWritingLab.Shared.Models.Entities
{
    [FirestoreData]
    public class QuestionModel
    {
        [FirestoreDocumentId]
        public string QuestionId { get; set; }
        // e.g. "q001", "q002"

        [FirestoreProperty] public string TaskType { get; set; }
        // "task1" | "task2"

        [FirestoreProperty] public string Category { get; set; }
        // e.g. "informal_invitation", "opinion_essay", "complaint_letter"

        [FirestoreProperty] public string Title { get; set; }
        // e.g. "Birthday Party Invitation"

        [FirestoreProperty] public string Instructions { get; set; }
        // Full question prompt shown to student

        [FirestoreProperty] public List<string> Requirements { get; set; }
        // Bullet points student must address

        [FirestoreProperty] public string Level { get; set; }
        // "B1" | "B2" | "C1"

        [FirestoreProperty] public bool IsActive { get; set; }
        // false = hidden from students

        [FirestoreProperty] public Timestamp ImportedAt { get; set; }
    }
}
