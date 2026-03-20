using Google.Cloud.Firestore;

namespace VstepWritingLab.Domain.ValueObjects;

[FirestoreData]
public record TaskRelevance(
    [property: FirestoreProperty("isRelevant")] bool IsRelevant,
    [property: FirestoreProperty("score")]      int  Score,
    [property: FirestoreProperty("verdicts")]   string[] Verdicts,
    [property: FirestoreProperty("missingPoints")] string[] MissingPoints,
    [property: FirestoreProperty("offTopicSentences")] string[] OffTopicSentences
);
