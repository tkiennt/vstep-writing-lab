using Google.Cloud.Firestore;
using System.Collections.Generic;

namespace VstepWritingLab.Shared.Models.Entities
{
    [FirestoreData]
    public class SentenceTemplateModel
    {
        [FirestoreDocumentId]
        public string TemplateId { get; set; }

        [FirestoreProperty] public string TaskType { get; set; }
        // "task1" | "task2"

        [FirestoreProperty] public string Category { get; set; }
        // Must match QuestionModel.Category exactly

        [FirestoreProperty] public string Part { get; set; }
        // task1: "introduction" | "body" | "closing"
        // task2: "introduction" | "body" | "conclusion"

        [FirestoreProperty] public List<string> Templates { get; set; }
        // List of sentence starters / templates for this part
        // e.g. ["Thank you for inviting me to your [event].", ...]

        [FirestoreProperty] public bool IsActive { get; set; }
    }
}
