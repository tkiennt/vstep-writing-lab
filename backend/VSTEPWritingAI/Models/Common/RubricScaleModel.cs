using Google.Cloud.Firestore;

namespace VSTEPWritingAI.Models.Common
{
    [FirestoreData]
    public class RubricScaleModel
    {
        [FirestoreProperty] public int Min { get; set; }      // 0
        [FirestoreProperty] public int Max { get; set; }      // 10
        [FirestoreProperty] public int Step { get; set; }     // 1
    }
}
