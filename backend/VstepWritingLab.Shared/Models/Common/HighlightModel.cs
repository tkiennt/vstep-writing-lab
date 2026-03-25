using Google.Cloud.Firestore;

namespace VstepWritingLab.Shared.Models.Common
{
    [FirestoreData]
    public class HighlightModel
    {
        [FirestoreProperty] public string Text { get; set; }
        // Exact phrase copied from student essay

        [FirestoreProperty] public string IssueEn { get; set; }
        [FirestoreProperty] public string IssueVi { get; set; }
        [FirestoreProperty] public string Issue { get; set; } // Legacy

        [FirestoreProperty] public string Type { get; set; }
        // "grammar" | "vocabulary" | "structure"
    }
}
