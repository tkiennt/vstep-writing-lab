using Google.Cloud.Firestore;

namespace VstepWritingLab.Domain.ValueObjects;

[FirestoreData]
public class ProgressSummary
{
    [FirestoreProperty("totalSubmissions")]   public int      TotalSubmissions   { get; set; }
    [FirestoreProperty("avgScore")]           public double   AvgScore           { get; set; }
    [FirestoreProperty("avgTaskFulfilment")]  public double   AvgTaskFulfilment  { get; set; }
    [FirestoreProperty("avgOrganization")]    public double   AvgOrganization    { get; set; }
    [FirestoreProperty("avgVocabulary")]      public double   AvgVocabulary      { get; set; }
    [FirestoreProperty("avgGrammar")]         public double   AvgGrammar         { get; set; }
    [FirestoreProperty("weakestCriterion")]   public string   WeakestCriterion   { get; set; } = string.Empty;
    [FirestoreProperty("strongestCriterion")] public string   StrongestCriterion { get; set; } = string.Empty;
    [FirestoreProperty("trend")]              public string   Trend              { get; set; } = string.Empty;
    [FirestoreProperty("trendValue")]         public double   TrendValue         { get; set; }
    [FirestoreProperty("currentCefr")]        public string   CurrentCefr        { get; set; } = string.Empty;
    [FirestoreProperty("vstepComparison")]    public string   VstepComparison    { get; set; } = string.Empty;
    [FirestoreProperty("relevanceRate")]      public double   RelevanceRate      { get; set; }
    [FirestoreProperty("lastUpdated")]        public DateTime LastUpdated        { get; set; }

    public ProgressSummary() { } // Firestore requires this

    public ProgressSummary(
        int totalSubmissions, double avgScore, double avgTaskFulfilment,
        double avgOrganization, double avgVocabulary, double avgGrammar,
        string weakestCriterion, string strongestCriterion, string trend,
        double trendValue, string currentCefr, string vstepComparison,
        double relevanceRate, DateTime lastUpdated)
    {
        TotalSubmissions = totalSubmissions;
        AvgScore = avgScore;
        AvgTaskFulfilment = avgTaskFulfilment;
        AvgOrganization = avgOrganization;
        AvgVocabulary = avgVocabulary;
        AvgGrammar = avgGrammar;
        WeakestCriterion = weakestCriterion;
        StrongestCriterion = strongestCriterion;
        Trend = trend;
        TrendValue = trendValue;
        CurrentCefr = currentCefr;
        VstepComparison = vstepComparison;
        RelevanceRate = relevanceRate;
        LastUpdated = lastUpdated;
    }
}
