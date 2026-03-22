using VstepWritingLab.Business.DTOs;
using VstepWritingLab.Domain.Entities;

namespace VstepWritingLab.Business.Mapping;

public static class GradingMapper
{
    public static FullAnalysisResponse ToFullAnalysisResponse(GradingResult r) =>
        new(
            r.Id,
            r.StudentId,
            r.ExamId,
            r.TaskType,
            r.GradedAt,
            r.TotalScore,
            r.CefrLevel,
            r.VstepComparison,
            r.Relevance,
            r.TaskFulfilment,
            r.Organization,
            r.Vocabulary,
            r.Grammar,
            r.StrengthsVi,
            r.ImprovementsVi,
            r.Corrections,
            r.InlineHighlights,
            r.RecommendedStructures,
            r.RewriteSamples,
            r.Roadmap,
            r.AiModel);
}
