using Microsoft.Extensions.Logging;
using VstepWritingLab.Domain.Entities;
using VstepWritingLab.Domain.Interfaces;
using VstepWritingLab.Domain.ValueObjects;
using VstepWritingLab.Business.DTOs;
using VstepWritingLab.Business.Helpers;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using VstepWritingLab.Business.Services;

namespace VstepWritingLab.Business.UseCases;

public interface IGradeEssayUseCase
{
    Task<Result<FullAnalysisResponse>> ExecuteAsync(GradeEssayCommand command, CancellationToken ct = default);
}

public class GradeEssayUseCase(
    IBackgroundGradingService backgroundGradingService,
    IGradingResultRepository repository,
    IExamPromptRepository promptRepository,
    IExamSessionRepository sessionRepository,
    IRubricContextService rubricService,
    ILogger<GradeEssayUseCase> logger) : IGradeEssayUseCase
{
    public async Task<Result<FullAnalysisResponse>> ExecuteAsync(GradeEssayCommand command, CancellationToken ct = default)
    {
        // 1. Fetch active session first to determine identity
        var activeSession = await sessionRepository.GetActiveSessionAsync(command.StudentId, command.EssayId, ct);
        var resultId = activeSession?.Id ?? Guid.NewGuid().ToString();

        logger.LogInformation("Processing grade for User: {StudentId}, Exam: {EssayId}, Session: {SessionId}", 
            command.StudentId, command.EssayId, resultId);

        // 2. Load exam + rubric context in parallel
        var examTask   = promptRepository.GetByIdAsync(command.EssayId, ct);
        var rubricTask = rubricService.GetContextAsync(command.EssayText, command.TaskType, ct);
        
        await Task.WhenAll(examTask, rubricTask);

        var exam = await examTask;
        if (exam is null)
            return Result<FullAnalysisResponse>.Fail($"Exam '{command.EssayId}' not found");

        var rubricContext = await rubricTask;

        // 3. Create Pending Domain Entity
        var gradingResult = new GradingResult(
            resultId,
            command.StudentId,
            command.EssayId,
            command.TaskType,
            DateTime.UtcNow,
            new TaskRelevance(true, 0, Array.Empty<string>(), Array.Empty<string>(), Array.Empty<string>()),
            new CriterionScore(0, "N/A", "", "", ""),
            new CriterionScore(0, "N/A", "", "", ""),
            new CriterionScore(0, "N/A", "", "", ""),
            new CriterionScore(0, "N/A", "", "", ""),
            Array.Empty<string>(),
            Array.Empty<string>(),
            Array.Empty<string>(),
            Array.Empty<string>(),
            Array.Empty<Correction>(),
            "", // AiModel
            Array.Empty<InlineHighlight>(),
            Array.Empty<RecommendedStructure>(),
            Array.Empty<RewriteSample>(),
            new GradingRoadmap("", "", 0, Array.Empty<WeeklyPlanTask>()),
            Array.Empty<SentenceFeedback>(),
            null, // ImprovementTracking
            command.Mode,
            command.EssayText,
            command.WordCount,
            "", // summaryEn
            "Đang chấm điểm...", // summaryVi
            "Pending"
        );

        // 4. Persistence (Save Pending history)
        logger.LogInformation("Saving Pending grading result {ResultId} for user {StudentId} (Mode: {Mode})", 
            gradingResult.Id, command.StudentId, command.Mode);
            
        await repository.SaveAsync(gradingResult, ct);

        // 5. Enqueue actual AI work to background service
        backgroundGradingService.EnqueueGradingTask(
            resultId,
            command,
            exam,
            rubricContext
        );

        // 6. Map to Response DTO (Pending form)
        var response = new FullAnalysisResponse(
            gradingResult.Id,
            gradingResult.StudentId,
            gradingResult.ExamId,
            gradingResult.TaskType,
            gradingResult.GradedAt,
            gradingResult.TotalScore,
            gradingResult.CefrLevel,
            gradingResult.VstepComparison,
            gradingResult.Relevance,
            gradingResult.TaskFulfilment,
            gradingResult.Organization,
            gradingResult.Vocabulary,
            gradingResult.Grammar,
            gradingResult.StrengthsVi,
            gradingResult.ImprovementsVi,
            gradingResult.Corrections,
            gradingResult.InlineHighlights,
            gradingResult.RecommendedStructures,
            gradingResult.RewriteSamples,
            gradingResult.Roadmap,
            gradingResult.AiModel,
            gradingResult.SentenceFeedback,
            gradingResult.ImprovementTracking,
            null, // GuideMode
            gradingResult.Mode
        );

        return Result<FullAnalysisResponse>.Ok(response);
    }
}
