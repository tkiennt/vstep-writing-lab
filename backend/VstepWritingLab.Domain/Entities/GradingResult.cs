using VstepWritingLab.Domain.ValueObjects;

namespace VstepWritingLab.Domain.Entities;

public class GradingResult
{
    public string   Id           { get; private set; } = string.Empty;
    public string   StudentId    { get; private set; } = string.Empty;
    public string   ExamId       { get; private set; } = string.Empty;
    public string   TaskType     { get; private set; } = string.Empty;
    public DateTime GradedAt     { get; private set; }

    // Task Relevance
    public TaskRelevance Relevance { get; private set; } = default!;

    // 4 criteria
    public CriterionScore TaskFulfilment { get; private set; } = default!;
    public CriterionScore Organization   { get; private set; } = default!;
    public CriterionScore Vocabulary     { get; private set; } = default!;
    public CriterionScore Grammar        { get; private set; } = default!;

    // Computed
    public double TotalScore     { get; private set; }
    public string CefrLevel      { get; private set; } = string.Empty;
    public string VstepComparison{ get; private set; } = string.Empty;

    // Feedback
    public string[]    StrengthsVi    { get; private set; } = Array.Empty<string>();
    public string[]    ImprovementsVi { get; private set; } = Array.Empty<string>();
    public Correction[] Corrections   { get; private set; } = Array.Empty<Correction>();
    public string       AiModel       { get; private set; } = string.Empty;

    // Analysis Details
    public InlineHighlight[]      InlineHighlights      { get; private set; } = Array.Empty<InlineHighlight>();
    public RecommendedStructure[] RecommendedStructures { get; private set; } = Array.Empty<RecommendedStructure>();
    public RewriteSample[]        RewriteSamples        { get; private set; } = Array.Empty<RewriteSample>();
    public GradingRoadmap         Roadmap               { get; private set; } = default!;

    // NEW:
    public SentenceFeedback[]    SentenceFeedback      { get; private set; } = Array.Empty<SentenceFeedback>();
    public ImprovementTracking?  ImprovementTracking   { get; private set; }
    public string                Mode                   { get; private set; } = "exam";

    public string EssayText { get; private set; } = string.Empty;
    public int    WordCount { get; private set; }
    public string Summary   { get; private set; } = string.Empty;

    // Constructor for mapping/deserialization
    public GradingResult(
        string id, string studentId, string examId, string taskType,
        DateTime gradedAt, TaskRelevance relevance,
        CriterionScore taskFulfilment, CriterionScore organization,
        CriterionScore vocabulary, CriterionScore grammar,
        string[] strengthsVi, string[] improvementsVi,
        Correction[] corrections, string aiModel,
        InlineHighlight[] highlights, RecommendedStructure[] structures,
        RewriteSample[] rewrites, GradingRoadmap roadmap,
        SentenceFeedback[] sentenceFeedback, ImprovementTracking? improvementTracking,
        string mode = "exam",
        string essayText = "",
        int wordCount = 0,
        string summary = "")
    {
        this.Id = id;
        this.StudentId = studentId;
        this.ExamId = examId;
        this.TaskType = taskType;
        this.GradedAt = gradedAt;
        this.Relevance = relevance;
        this.TaskFulfilment = taskFulfilment;
        this.Organization = organization;
        this.Vocabulary = vocabulary;
        this.Grammar = grammar;
        this.StrengthsVi = strengthsVi;
        this.ImprovementsVi = improvementsVi;
        this.Corrections = corrections;
        this.AiModel = aiModel;
        
        this.InlineHighlights = highlights ?? Array.Empty<InlineHighlight>();
        this.RecommendedStructures = structures ?? Array.Empty<RecommendedStructure>();
        this.RewriteSamples = rewrites ?? Array.Empty<RewriteSample>();
        this.Roadmap = roadmap;

        this.SentenceFeedback = sentenceFeedback ?? Array.Empty<SentenceFeedback>();
        this.ImprovementTracking = improvementTracking;
        this.Mode = mode;
        this.EssayText = essayText;
        this.WordCount = wordCount;
        this.Summary = summary;

        TotalScore = ComputeTotal(
            taskFulfilment.Score, organization.Score,
            vocabulary.Score, grammar.Score);

        CefrLevel = GetCefrLevel(TotalScore);
        VstepComparison = GetVstepComparison(TotalScore);
    }

    // Domain method: compute total from 4 scores
    public static double ComputeTotal(int tf, int org, int voc, int gr)
        => Math.Round((tf + org + voc + gr) / 4.0 * 2,
                      MidpointRounding.AwayFromZero) / 2.0;

    public static string GetCefrLevel(double score) => score switch {
        >= 8.5 => "C1", >= 6.5 => "B2", >= 4.5 => "B1", _ => "Below B1"
    };

    public static string GetVstepComparison(double score) => score switch {
        >= 8.5 => "Đạt C1 — Xuất sắc",
        >= 6.5 => "Đạt B2 — Khá tốt",
        >= 4.5 => "Đạt B1 — Đạt yêu cầu cơ bản",
        _      => "Chưa đạt B1 — Cần cải thiện nhiều"
    };
}
