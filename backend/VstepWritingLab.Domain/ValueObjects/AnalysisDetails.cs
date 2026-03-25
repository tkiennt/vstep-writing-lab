using Google.Cloud.Firestore;

namespace VstepWritingLab.Domain.ValueObjects;

[FirestoreData]
public record InlineHighlight(
    [property: FirestoreProperty("type")]     string Type,     // "error" | "strength"
    [property: FirestoreProperty("quote")]    string Quote,    // verbatim from essay
    [property: FirestoreProperty("issueEn")]  string IssueEn,
    [property: FirestoreProperty("issueVi")]  string IssueVi,
    [property: FirestoreProperty("fixEn")]    string FixEn,
    [property: FirestoreProperty("fixVi")]    string FixVi,
    [property: FirestoreProperty("category")] string Category  // "grammar" | "vocabulary" | etc
)
{
    public InlineHighlight() : this("error", "", "", "", "", "", "grammar") { }
}

[FirestoreData]
public record RecommendedStructure(
    [property: FirestoreProperty("structureName")] string StructureName,
    [property: FirestoreProperty("example")]       string Example,
    [property: FirestoreProperty("whyUseItEn")]    string WhyUseItEn,
    [property: FirestoreProperty("whyUseItVi")]    string WhyUseItVi
)
{
    public RecommendedStructure() : this("", "", "", "") { }
}

[FirestoreData]
public record RewriteSample(
    [property: FirestoreProperty("original")]      string Original,
    [property: FirestoreProperty("rewritten")]     string Rewritten,
    [property: FirestoreProperty("explanationEn")] string ExplanationEn,
    [property: FirestoreProperty("explanationVi")] string ExplanationVi
)
{
    public RewriteSample() : this("", "", "", "") { }
}

[FirestoreData]
public record GradingRoadmap(
    [property: FirestoreProperty("currentLevel")]   string CurrentLevel,
    [property: FirestoreProperty("targetLevel")]    string TargetLevel,
    [property: FirestoreProperty("estimatedWeeks")] int    EstimatedWeeks,
    [property: FirestoreProperty("weeklyPlan")]     WeeklyPlanTask[] WeeklyPlan
)
{
    public GradingRoadmap() : this("", "", 0, Array.Empty<WeeklyPlanTask>()) { }
}

[FirestoreData]
public record WeeklyPlanTask(
    [property: FirestoreProperty("week")]  int      Week,
    [property: FirestoreProperty("focus")] string   Focus,
    [property: FirestoreProperty("tasks")] string[] Tasks,
    [property: FirestoreProperty("goal")]  string   Goal
)
{
    public WeeklyPlanTask() : this(0, "", Array.Empty<string>(), "") { }
}
