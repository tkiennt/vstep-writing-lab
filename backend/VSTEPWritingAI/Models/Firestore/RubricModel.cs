using Google.Cloud.Firestore;
using System.Collections.Generic;
using VSTEPWritingAI.Models.Common;

namespace VSTEPWritingAI.Models.Firestore
{
    [FirestoreData]
    public class RubricModel
    {
        [FirestoreDocumentId]
        public string RubricId { get; set; }
        // "vstep_task1" | "vstep_task2"

        [FirestoreProperty] public string TaskType { get; set; }
        // "task1" | "task2"

        [FirestoreProperty] public string Name { get; set; }
        // "VSTEP Writing Rating Scale - Task 1"

        [FirestoreProperty] public string Source { get; set; }
        // "ULIS-VNU"

        [FirestoreProperty] public RubricScaleModel Scale { get; set; }
        // { Min: 0, Max: 10, Step: 1 }

        [FirestoreProperty]
        public Dictionary<string, RubricCriterionModel> Criteria { get; set; }
        // Keys: "taskFulfilment", "organization", "vocabulary", "grammar"
        // Each contains Weight, SubFactors, Descriptors (band 0-10)
    }
}
