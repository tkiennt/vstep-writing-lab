using Google.Cloud.Firestore;
using System.Collections.Generic;

namespace VstepWritingLab.Shared.Models.Common
{
    [FirestoreData]
    public class RubricCriterionModel
    {
        [FirestoreProperty("weight")] public int Weight { get; set; }
        // Always 1 — all 4 criteria have equal weight

        [FirestoreProperty("subFactors")] public List<string> SubFactors { get; set; } = null!;
        // e.g. ["requirements (format & length)", "purposes", "tone", "key points"]

        [FirestoreProperty("descriptors")] public Dictionary<string, string> Descriptors { get; set; } = null!;
        // Key = band "0" to "10", Value = descriptor text
    }
}
