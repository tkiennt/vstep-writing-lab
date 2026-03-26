using Google.Cloud.Firestore;
using System.Collections.Generic;

namespace VstepWritingLab.Shared.Models.Entities
{
    [FirestoreData]
    public class QuestionModel
    {
        [FirestoreDocumentId]
        public string QuestionId { get; set; }

        // Maps to exam_prompts field names (camelCase/snake_case as stored)
        [FirestoreProperty("taskType")]        public string TaskType { get; set; }
        [FirestoreProperty("topicCategory")]   public string Category { get; set; }
        [FirestoreProperty("topicKeyword")]    public string TopicKeyword { get; set; }
        [FirestoreProperty("Title")]           public string Title { get; set; }
        [FirestoreProperty("instruction")]     public string Instructions { get; set; }
        [FirestoreProperty("keyPoints")]       public List<string> Requirements { get; set; }
        [FirestoreProperty("cefrLevel")]       public string Level { get; set; }
        [FirestoreProperty("isActive")]        public bool IsActive { get; set; }
        [FirestoreProperty("createdAt")]       public Timestamp ImportedAt { get; set; }

        // Extra fields present in exam_prompts
        [FirestoreProperty("essayType")]       public string EssayType { get; set; }
        [FirestoreProperty("scenario")]        public string Scenario { get; set; }
    }
}
