using Google.Cloud.Firestore;
using System.Collections.Generic;

namespace VstepWritingLab.Shared.Models.Entities
{
    [FirestoreData]
    public class QuestionModel
    {
        [FirestoreDocumentId]
        public string QuestionId { get; set; }

        [FirestoreProperty] public string TaskType { get; set; }
        [FirestoreProperty] public string Category { get; set; }
        [FirestoreProperty] public string TopicCategory { get; set; }
        [FirestoreProperty] public string TopicKeyword { get; set; }
        [FirestoreProperty] public string Title { get; set; }
        [FirestoreProperty] public string Instructions { get; set; }
        [FirestoreProperty] public List<string> Requirements { get; set; }
        [FirestoreProperty] public string Level { get; set; }
        [FirestoreProperty] public bool IsActive { get; set; }
        [FirestoreProperty] public Timestamp ImportedAt { get; set; }
    }
}
