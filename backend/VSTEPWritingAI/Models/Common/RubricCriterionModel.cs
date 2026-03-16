using Google.Cloud.Firestore;
using System.Collections.Generic;

namespace VSTEPWritingAI.Models.Common
{
    [FirestoreData]
    public class RubricCriterionModel
    {
        [FirestoreProperty] public int Weight { get; set; }
        // Always 1 — all 4 criteria have equal weight

        [FirestoreProperty] public List<string> SubFactors { get; set; }
        // e.g. ["requirements (format & length)", "purposes", "tone", "key points"]

        [FirestoreProperty] public Dictionary<string, string> Descriptors { get; set; }
        // Key = band "0" to "10", Value = descriptor text
    }
}
