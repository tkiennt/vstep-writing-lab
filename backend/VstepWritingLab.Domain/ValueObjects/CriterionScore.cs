using Google.Cloud.Firestore;

namespace VstepWritingLab.Domain.ValueObjects;

[FirestoreData]
public record CriterionScore(
    [property: FirestoreProperty("score")] int    Score,                 // 0-10
    [property: FirestoreProperty("band")]  string BandLabel,
    [property: FirestoreProperty("feedbackEn")] string FeedbackEn,
    [property: FirestoreProperty("feedbackVi")] string FeedbackVi,
    [property: FirestoreProperty("evidenceEn")] string EvidenceEn
)
{
    public static string GetBandLabel(int score) => score switch {
        >= 9 => "Xuất sắc",
        >= 7 => "Tốt",
        >= 5 => "Đạt yêu cầu",
        >= 3 => "Yếu",
        _    => "Rất yếu"
    };
    public bool IsValid => Score is >= 0 and <= 10;
}
