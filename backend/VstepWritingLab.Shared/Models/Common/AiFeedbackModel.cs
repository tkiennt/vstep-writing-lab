using Google.Cloud.Firestore;
using System.Collections.Generic;

namespace VstepWritingLab.Shared.Models.Common
{
    [FirestoreData]
    public class AiFeedbackModel
    {
        [FirestoreProperty] public string SummaryEn { get; set; }
        [FirestoreProperty] public string SummaryVi { get; set; }
        [FirestoreProperty] public string Summary { get; set; } // Legacy

        [FirestoreProperty] public List<string> SuggestionsEn { get; set; }
        [FirestoreProperty] public List<string> SuggestionsVi { get; set; }
        [FirestoreProperty] public List<string> Suggestions { get; set; } // Legacy

        [FirestoreProperty] public List<HighlightModel> Highlights { get; set; }
        // Error highlights from the essay
    }
}
