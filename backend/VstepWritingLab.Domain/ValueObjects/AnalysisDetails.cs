using Google.Cloud.Firestore;

namespace VstepWritingLab.Domain.ValueObjects;

[FirestoreData]
public record InlineHighlight(
    [property: FirestoreProperty("type")]     string Type,     // "error" | "strength"
    [property: FirestoreProperty("quote")]    string Quote,    // verbatim from essay
    [property: FirestoreProperty("issue")]    string Issue,
    [property: FirestoreProperty("issueVi")]  string IssueVi,
    [property: FirestoreProperty("fix")]      string Fix,
    [property: FirestoreProperty("category")] string Category  // "grammar" | "vocabulary" | etc
);

[FirestoreData]
public record RecommendedStructure(
    [property: FirestoreProperty("structureName")] string StructureName,
    [property: FirestoreProperty("example")]       string Example,
    [property: FirestoreProperty("whyUseItVi")]    string WhyUseItVi
);

[FirestoreData]
public record RewriteSample(
    [property: FirestoreProperty("original")]      string Original,
    [property: FirestoreProperty("rewritten")]     string Rewritten,
    [property: FirestoreProperty("explanationVi")] string ExplanationVi
);

[FirestoreData]
public record GradingRoadmap(
    [property: FirestoreProperty("currentLevel")]   string CurrentLevel,
    [property: FirestoreProperty("targetLevel")]    string TargetLevel,
    [property: FirestoreProperty("estimatedWeeks")] int    EstimatedWeeks,
    [property: FirestoreProperty("weeklyPlan")]     WeeklyPlanTask[] WeeklyPlan
);

[FirestoreData]
public record WeeklyPlanTask(
    [property: FirestoreProperty("week")]  int      Week,
    [property: FirestoreProperty("focus")] string   Focus,
    [property: FirestoreProperty("tasks")] string[] Tasks,
    [property: FirestoreProperty("goal")]  string   Goal
);
