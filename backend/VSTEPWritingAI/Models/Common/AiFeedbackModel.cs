using Google.Cloud.Firestore;
using System.Collections.Generic;

namespace VSTEPWritingAI.Models.Common
{
    [FirestoreData]
    public class AiFeedbackModel
    {
        [FirestoreProperty] public string Summary { get; set; }
        // 2-3 sentence overall assessment

        [FirestoreProperty] public List<string> Suggestions { get; set; }
        // 3 specific improvement suggestions

        [FirestoreProperty] public List<HighlightModel> Highlights { get; set; }
        // Error highlights from the essay
    }
}
