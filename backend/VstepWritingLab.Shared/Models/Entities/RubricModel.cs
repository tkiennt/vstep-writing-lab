using Google.Cloud.Firestore;
using System.Collections.Generic;
using VstepWritingLab.Shared.Models.Common;

namespace VstepWritingLab.Shared.Models.Entities
{
    [FirestoreData]
    public class RubricModel
    {
        [FirestoreDocumentId]
        public string RubricId { get; set; } = null!;
        // "vstep_task1" | "vstep_task2"

        [FirestoreProperty("taskType")] public string TaskType { get; set; } = null!;
        // "task1" | "task2"

        [FirestoreProperty("name")] public string Name { get; set; } = null!;
        // "VSTEP Writing Rating Scale - Task 1"

        [FirestoreProperty("source")] public string Source { get; set; } = null!;
        // "ULIS-VNU"

        [FirestoreProperty("scale")] public RubricScaleModel Scale { get; set; } = null!;
        // { Min: 0, Max: 10, Step: 1 }

        [FirestoreProperty("criteria")]
        public Dictionary<string, RubricCriterionModel> Criteria { get; set; } = null!;
        // Keys: "taskFulfilment", "organization", "vocabulary", "grammar"
        // Each contains Weight, SubFactors, Descriptors (band 0-10)
    }
}
