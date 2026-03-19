namespace VstepWritingLab.Domain.ValueObjects;

public record TaskRelevance(
    bool     IsRelevant,
    int      RelevanceScore,      // 0-10
    string   VerdictEn,
    string   VerdictVi,
    string[] MissingPointsEn,
    string[] MissingPointsVi,
    string[] OffTopicSentences
);
