using Google.Cloud.Firestore;

namespace VstepWritingLab.Domain.ValueObjects;

/// <summary>
/// Criterion score value object.
/// NOTE: Must be a class with a parameterless constructor and get/set properties
/// for the Google.Cloud.Firestore SDK to deserialize nested objects correctly.
/// Using a positional record (init-only setters) causes the SDK to silently skip
/// all fields and return the object with default (0) values.
/// </summary>
[FirestoreData]
public class CriterionScore
{
    [FirestoreProperty("score")] public int    Score      { get; set; }  // 0-10
    [FirestoreProperty("band")]  public string BandLabel  { get; set; } = "Yếu";
    [FirestoreProperty("feedbackEn")] public string FeedbackEn { get; set; } = "";
    [FirestoreProperty("feedbackVi")] public string FeedbackVi { get; set; } = "";
    [FirestoreProperty("evidenceEn")] public string EvidenceEn { get; set; } = "";

    // Parameterless constructor required by Firestore SDK
    public CriterionScore() { }

    // Convenience constructor for use in code
    public CriterionScore(int score, string bandLabel, string feedbackEn, string feedbackVi, string evidenceEn)
    {
        Score      = score;
        BandLabel  = bandLabel;
        FeedbackEn = feedbackEn;
        FeedbackVi = feedbackVi;
        EvidenceEn = evidenceEn;
    }

    public static string GetBandLabel(int score) => score switch {
        >= 9 => "Xuất sắc",
        >= 7 => "Tốt",
        >= 5 => "Đạt yêu cầu",
        >= 3 => "Yếu",
        _    => "Rất yếu"
    };

    public bool IsValid => Score is >= 0 and <= 10;
}
