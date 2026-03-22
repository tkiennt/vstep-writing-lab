using Google.Cloud.Firestore;
using VstepWritingLab.Domain.Entities;
using VstepWritingLab.Domain.ValueObjects;

namespace VstepWritingLab.Data.PersistenceModels;

[FirestoreData]
public class GradingResultDocument
{
    [FirestoreDocumentId] public string Id { get; set; } = string.Empty;
    [FirestoreProperty("SubmissionId")] public string SubmissionId { get; set; } = string.Empty;
    [FirestoreProperty("UserId")] public string StudentId { get; set; } = string.Empty;
    [FirestoreProperty("QuestionId")] public string ExamId { get; set; } = string.Empty;
    [FirestoreProperty] public string TaskType { get; set; } = string.Empty;
    [FirestoreProperty("CreatedAt")] public DateTime GradedAt { get; set; }
    [FirestoreProperty] public double TotalScore { get; set; }
    [FirestoreProperty] public string CefrLevel { get; set; } = string.Empty;
    [FirestoreProperty] public string VstepComparison { get; set; } = string.Empty;
    
    // Domain objects mapped directly via [FirestoreData] on the records themselves (if possible) 
    // or as Dictionaries. Firestore SDK handles records with properties if attributed.
    [FirestoreProperty] public TaskRelevance  Relevance      { get; set; } = default!;
    [FirestoreProperty] public CriterionScore TaskFulfilment { get; set; } = default!;
    [FirestoreProperty] public CriterionScore Organization   { get; set; } = default!;
    [FirestoreProperty] public CriterionScore Vocabulary     { get; set; } = default!;
    [FirestoreProperty] public CriterionScore Grammar        { get; set; } = default!;
    
    [FirestoreProperty] public string[]     StrengthsVi    { get; set; } = Array.Empty<string>();
    [FirestoreProperty] public string[]     ImprovementsVi { get; set; } = Array.Empty<string>();
    [FirestoreProperty] public Correction[] Corrections    { get; set; } = Array.Empty<Correction>();
    [FirestoreProperty] public string       AiModel        { get; set; } = string.Empty;

    [FirestoreProperty] public InlineHighlight[]      InlineHighlights      { get; set; } = Array.Empty<InlineHighlight>();
    [FirestoreProperty] public RecommendedStructure[] RecommendedStructures { get; set; } = Array.Empty<RecommendedStructure>();
    [FirestoreProperty] public RewriteSample[]        RewriteSamples        { get; set; } = Array.Empty<RewriteSample>();
    [FirestoreProperty] public GradingRoadmap?         Roadmap               { get; set; } = default!;

    [FirestoreProperty] public SentenceFeedback[]    SentenceFeedback      { get; set; } = Array.Empty<SentenceFeedback>();
    [FirestoreProperty] public ImprovementTracking?  ImprovementTracking   { get; set; }
    [FirestoreProperty] public string                Mode                   { get; set; } = "exam";

    [FirestoreProperty] public string EssayText { get; set; } = string.Empty;
    [FirestoreProperty] public int    WordCount { get; set; }
    [FirestoreProperty] public string Summary   { get; set; } = string.Empty;

    public static GradingResultDocument FromDomain(GradingResult domain) => new()
    {
        Id = domain.Id,
        SubmissionId = domain.Id,
        StudentId = domain.StudentId,
        ExamId = domain.ExamId,
        TaskType = domain.TaskType,
        GradedAt = domain.GradedAt.ToUniversalTime(),
        TotalScore = domain.TotalScore,
        CefrLevel = domain.CefrLevel,
        VstepComparison = domain.VstepComparison,
        Relevance = domain.Relevance,
        TaskFulfilment = domain.TaskFulfilment,
        Organization = domain.Organization,
        Vocabulary = domain.Vocabulary,
        Grammar = domain.Grammar,
        StrengthsVi = domain.StrengthsVi,
        ImprovementsVi = domain.ImprovementsVi,
        Corrections = domain.Corrections,
        AiModel = domain.AiModel,
        InlineHighlights = domain.InlineHighlights,
        RecommendedStructures = domain.RecommendedStructures,
        RewriteSamples = domain.RewriteSamples,
        Roadmap = domain.Roadmap,
        SentenceFeedback = domain.SentenceFeedback,
        ImprovementTracking = domain.ImprovementTracking,
        Mode = domain.Mode,
        EssayText = domain.EssayText,
        WordCount = domain.WordCount,
        Summary = domain.Summary
    };

    public GradingResult ToDomain()
    {
        // Provide fallbacks for null objects (e.g. legacy data) to avoid NullReferenceException in domain constructor
        var relevance = Relevance ?? new TaskRelevance(true, 10, Array.Empty<string>(), Array.Empty<string>(), Array.Empty<string>());
        var tf = TaskFulfilment ?? new CriterionScore(0, "N/A", "", "", "");
        var org = Organization ?? new CriterionScore(0, "N/A", "", "", "");
        var voc = Vocabulary ?? new CriterionScore(0, "N/A", "", "", "");
        var gra = Grammar ?? new CriterionScore(0, "N/A", "", "", "");
        var roadmap = Roadmap ?? new GradingRoadmap("", "", 0, Array.Empty<WeeklyPlanTask>());

        return new GradingResult(
            Id, StudentId, ExamId, TaskType, GradedAt,
            relevance, tf, org, voc, gra, 
            StrengthsVi ?? Array.Empty<string>(), 
            ImprovementsVi ?? Array.Empty<string>(),
            Corrections ?? Array.Empty<Correction>(), 
            AiModel ?? "", 
            InlineHighlights ?? Array.Empty<InlineHighlight>(),
            RecommendedStructures ?? Array.Empty<RecommendedStructure>(), 
            RewriteSamples ?? Array.Empty<RewriteSample>(), 
            roadmap,
            SentenceFeedback ?? Array.Empty<SentenceFeedback>(), 
            ImprovementTracking, 
            Mode ?? "exam",
            EssayText ?? "", 
            WordCount,
            Summary ?? "Xem chi tiết đánh giá từng tiêu chí bên dưới."
        );
    }
}
