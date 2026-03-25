using Google.Cloud.Firestore;

namespace VstepWritingLab.Domain.ValueObjects;

[FirestoreData]
public record SentenceFeedback(
    [property: FirestoreProperty("sentence")]    string Sentence,
    [property: FirestoreProperty("isGood")]      bool   IsGood,
    [property: FirestoreProperty("issueType")]   string IssueType,    // "grammar"|"vocab"|"coherence"|"task"|"none"
    [property: FirestoreProperty("explanationEn")] string ExplanationEn,
    [property: FirestoreProperty("explanationVi")] string ExplanationVi,
    [property: FirestoreProperty("suggestionEn")]  string SuggestionEn,
    [property: FirestoreProperty("suggestionVi")]  string SuggestionVi
)
{
    public SentenceFeedback() : this("", true, "none", "", "", "", "") { }
}

[FirestoreData]
public record ImprovementTracking(
    [property: FirestoreProperty("improved")]    string[] Improved,      // weaknesses from history that improved
    [property: FirestoreProperty("notImproved")] string[] NotImproved,   // weaknesses from history still present
    [property: FirestoreProperty("newIssues")]   string[] NewIssues      // new problems not in history
)
{
    public ImprovementTracking() : this(Array.Empty<string>(), Array.Empty<string>(), Array.Empty<string>()) { }
}

[FirestoreData]
public record GuideOutline(
    [property: FirestoreProperty("introduction")] string[] Introduction,
    [property: FirestoreProperty("body")]         string[] Body,
    [property: FirestoreProperty("conclusion")]   string[] Conclusion
)
{
    public GuideOutline() : this(Array.Empty<string>(), Array.Empty<string>(), Array.Empty<string>()) { }
}

[FirestoreData]
public record GuideSentenceSuggestions(
    [property: FirestoreProperty("introduction")] string[] Introduction,
    [property: FirestoreProperty("body")]         string[] Body,
    [property: FirestoreProperty("conclusion")]   string[] Conclusion
)
{
    public GuideSentenceSuggestions() : this(Array.Empty<string>(), Array.Empty<string>(), Array.Empty<string>()) { }
}

[FirestoreData]
public record GuideOutput(
    [property: FirestoreProperty("outline")]             GuideOutline             Outline,
    [property: FirestoreProperty("sentenceSuggestions")] GuideSentenceSuggestions SentenceSuggestions
)
{
    public GuideOutput() : this(new GuideOutline(), new GuideSentenceSuggestions()) { }
}

public record UserHistory(
    string[] Weaknesses,
    float[]  PastScores,
    string   Level
);
