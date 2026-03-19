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
    [FirestoreProperty] public Timestamp GradedAt { get; set; }

    [FirestoreProperty] public TaskRelevance Relevance { get; set; } = default!;
    [FirestoreProperty] public CriterionScore TaskFulfilment { get; set; } = default!;
    [FirestoreProperty] public CriterionScore Organization { get; set; } = default!;
    [FirestoreProperty] public CriterionScore Vocabulary { get; set; } = default!;
    [FirestoreProperty] public CriterionScore Grammar { get; set; } = default!;

    [FirestoreProperty] public string[] StrengthsVi { get; set; } = Array.Empty<string>();
    [FirestoreProperty] public string[] ImprovementsVi { get; set; } = Array.Empty<string>();
    [FirestoreProperty] public Correction[] Corrections { get; set; } = Array.Empty<Correction>();
    [FirestoreProperty] public string AiModel { get; set; } = string.Empty;

    public static GradingResultDocument FromDomain(GradingResult domain) => new()
    {
        Id = domain.Id,
        StudentId = domain.StudentId,
        ExamId = domain.ExamId,
        TaskType = domain.TaskType,
        GradedAt = Timestamp.FromDateTime(domain.GradedAt.ToUniversalTime()),
        Relevance = domain.Relevance,
        TaskFulfilment = domain.TaskFulfilment,
        Organization = domain.Organization,
        Vocabulary = domain.Vocabulary,
        Grammar = domain.Grammar,
        StrengthsVi = domain.StrengthsVi,
        ImprovementsVi = domain.ImprovementsVi,
        Corrections = domain.Corrections,
        AiModel = domain.AiModel
    };

    public GradingResult ToDomain() => new GradingResult(
        Id, StudentId, ExamId, TaskType,
        GradedAt.ToDateTime(),
        Relevance,
        TaskFulfilment, Organization, Vocabulary, Grammar,
        StrengthsVi, ImprovementsVi, Corrections, AiModel
    );
}
