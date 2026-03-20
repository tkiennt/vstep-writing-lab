using Google.Cloud.Firestore;

namespace VstepWritingLab.Domain.ValueObjects;

[FirestoreData]
public record SentenceFeedback(
    [property: FirestoreProperty("sentence")]    string Sentence,
    [property: FirestoreProperty("isGood")]      bool   IsGood,
    [property: FirestoreProperty("issueType")]   string IssueType,    // "grammar"|"vocab"|"coherence"|"task"|"none"
    [property: FirestoreProperty("explanation")] string Explanation,
    [property: FirestoreProperty("suggestion")]  string Suggestion
);

[FirestoreData]
public record ImprovementTracking(
    [property: FirestoreProperty("improved")]    string[] Improved,      // weaknesses from history that improved
    [property: FirestoreProperty("notImproved")] string[] NotImproved,   // weaknesses from history still present
    [property: FirestoreProperty("newIssues")]   string[] NewIssues      // new problems not in history
);

[FirestoreData]
public record GuideOutline(
    [property: FirestoreProperty("introduction")] string[] Introduction,
    [property: FirestoreProperty("body")]         string[] Body,
    [property: FirestoreProperty("conclusion")]   string[] Conclusion
);

[FirestoreData]
public record GuideSentenceSuggestions(
    [property: FirestoreProperty("introduction")] string[] Introduction,
    [property: FirestoreProperty("body")]         string[] Body,
    [property: FirestoreProperty("conclusion")]   string[] Conclusion
);

[FirestoreData]
public record GuideOutput(
    [property: FirestoreProperty("outline")]             GuideOutline             Outline,
    [property: FirestoreProperty("sentenceSuggestions")] GuideSentenceSuggestions SentenceSuggestions
);

public record UserHistory(
    string[] Weaknesses,
    float[]  PastScores,
    string   Level
);
