using Google.Cloud.Firestore;

namespace VstepWritingLab.Shared.Models.Common
{
    [FirestoreData]
    public class AiScoreModel
    {
        [FirestoreProperty] public int TaskFulfilment { get; set; }
        [FirestoreProperty] public int Organization { get; set; }
        [FirestoreProperty] public int Vocabulary { get; set; }
        [FirestoreProperty] public int Grammar { get; set; }
        [FirestoreProperty] public double Overall { get; set; }
        // Overall = Math.Round((TaskFulfilment + Organization + Vocabulary + Grammar) / 4.0, 1)
    }
}
