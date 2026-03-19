namespace VstepWritingLab.Domain.ValueObjects;

public record CriterionScore(
    int    Score,                 // 0-10
    string BandLabel,
    string FeedbackEn,
    string FeedbackVi,
    string EvidenceEn
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
