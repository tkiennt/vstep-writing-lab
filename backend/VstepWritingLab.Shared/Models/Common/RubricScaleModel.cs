using Google.Cloud.Firestore;

namespace VstepWritingLab.Shared.Models.Common
{
    [FirestoreData]
    public class RubricScaleModel
    {
        [FirestoreProperty("min")] public int Min { get; set; }      // 0
        [FirestoreProperty("max")] public int Max { get; set; }      // 10
        [FirestoreProperty("step")] public int Step { get; set; }     // 1
    }
}
