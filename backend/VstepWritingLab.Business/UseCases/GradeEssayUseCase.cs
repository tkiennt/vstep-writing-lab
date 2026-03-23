using Microsoft.Extensions.Logging;
using VstepWritingLab.Domain.Entities;
using VstepWritingLab.Domain.Interfaces;
using VstepWritingLab.Domain.ValueObjects;
using VstepWritingLab.Business.DTOs;
using VstepWritingLab.Business.Helpers;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;

namespace VstepWritingLab.Business.UseCases;

public interface IGradeEssayUseCase
{
    Task<Result<FullAnalysisResponse>> ExecuteAsync(GradeEssayCommand command, CancellationToken ct = default);
}

public class GradeEssayUseCase(
    IGradingAiService aiService,
    IGradingResultRepository repository,
    IExamPromptRepository promptRepository,
    IExamSessionRepository sessionRepository,
    IRubricContextService rubricService,
    IServiceScopeFactory scopeFactory,
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

        // 3. Call AI Service (tuned model with fallback)
        var domainHistory = command.UserHistory == null ? null : new Domain.ValueObjects.UserHistory(
            command.UserHistory.Weaknesses,
            command.UserHistory.PastScores,
            command.UserHistory.Level);

        var aiResult = await aiService.GradeAsync(
            rubricContext, command.TaskType, command.Prompt,
            exam.KeyPoints, command.WordCount, command.EssayText,
            command.Mode, domainHistory, command.Language ?? "vi", ct);

        if (!aiResult.IsSuccess || aiResult.Value == null) 
            return Result<FullAnalysisResponse>.Fail(FriendlyErrorMapper.MapAiError(aiResult.Error ?? "AI grading failed"));
        
        var ai = aiResult.Value;

        // 4. Create Domain Entity using existing session ID
        var gradingResult = new GradingResult(
            resultId,
            command.StudentId,
            command.EssayId,
            command.TaskType,
            DateTime.UtcNow,
            ai.Relevance,
            ai.TaskFulfilment,
            ai.Organization,
            ai.Vocabulary,
            ai.Grammar,
            ai.StrengthsVi,
            ai.ImprovementsVi,
            ai.Corrections,
            ai.AiModel,
            ai.InlineHighlights,
            ai.RecommendedStructures,
            ai.RewriteSamples,
            ai.Roadmap,
            ai.SentenceFeedback,
            ai.ImprovementTracking,
            command.Mode,
            command.EssayText,
            command.WordCount
        );

        // 5. Map to Response DTO
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
            gradingResult.Roadmap!,
            gradingResult.AiModel,
            gradingResult.SentenceFeedback,
            gradingResult.ImprovementTracking,
            ai.GuideMode,
            gradingResult.Mode
        );

        // 6. Persistence (Always save history)
        logger.LogInformation("Saving grading result {ResultId} for user {StudentId} (Mode: {Mode})", 
            gradingResult.Id, command.StudentId, command.Mode);
            
        await repository.SaveAsync(gradingResult, ct);
        await promptRepository.IncrementUsageAsync(command.EssayId, ct);

        // Update session status to Completed
        if (activeSession != null)
        {
            activeSession.Status = ExamSessionStatus.Completed;
            activeSession.LastUpdatedAt = DateTime.UtcNow;
            await sessionRepository.UpdateAsync(activeSession, ct);
        }

        // 7. Progress update (ONLY for exam mode)
        if (command.Mode == "exam")
        {
            logger.LogInformation("Updating progress for user {StudentId} after Exam submission", command.StudentId);
            _ = Task.Run(async () => {
                try {
                    using var scope = scopeFactory.CreateScope();
                    var scopedProgress = scope.ServiceProvider.GetRequiredService<IProgressUseCase>();
                    await scopedProgress.UpdateAsync(command.StudentId);
                } catch (Exception ex) {
                    logger.LogError(ex, "Background progress update failed for User {StudentId}", command.StudentId);
                }
            });
        }

        return Result<FullAnalysisResponse>.Ok(response);
    }
}
