using Google.Cloud.Firestore;
using VstepWritingLab.Domain.Entities;
using VstepWritingLab.Domain.ValueObjects;

namespace VstepWritingLab.Data.PersistenceModels;

[FirestoreData]
public class GradingResultDocument
{
    [FirestoreDocumentId] public string Id { get; set; } = string.Empty;
    [FirestoreProperty] public string StudentId { get; set; } = string.Empty;
    [FirestoreProperty] public string ExamId { get; set; } = string.Empty;
    [FirestoreProperty] public string TaskType { get; set; } = string.Empty;
    [FirestoreProperty] public DateTime GradedAt { get; set; }
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

    public static GradingResultDocument FromDomain(GradingResult domain, string essayText, int wordCount) => new()
    {
        Id = domain.Id,
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
        EssayText = essayText,
        WordCount = wordCount
    };

    public GradingResult ToDomain()
    {
        return new GradingResult(
            Id, StudentId, ExamId, TaskType, GradedAt,
            Relevance, TaskFulfilment, Organization,
            Vocabulary, Grammar, StrengthsVi, ImprovementsVi,
            Corrections, AiModel, InlineHighlights,
            RecommendedStructures, RewriteSamples, Roadmap!,
            SentenceFeedback, ImprovementTracking, Mode
        );
    }
}
