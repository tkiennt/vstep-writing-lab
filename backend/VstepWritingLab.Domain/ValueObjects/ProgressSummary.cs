namespace VstepWritingLab.Domain.ValueObjects;

public record ProgressSummary(
    int      TotalSubmissions,
    double   AvgScore,
    double   AvgTaskFulfilment,
    double   AvgOrganization,
    double   AvgVocabulary,
    double   AvgGrammar,
    string   WeakestCriterion,
    string   StrongestCriterion,
    string   Trend,           // "Improving"|"Stable"|"Declining"
    double   TrendValue,
    string   CurrentCefr,
    string   VstepComparison,
    double   RelevanceRate,
    DateTime LastUpdated
);
