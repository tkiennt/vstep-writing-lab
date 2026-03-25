using System;
using System.Threading;
using System.Threading.Tasks;
using MassTransit;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using VstepWritingLab.API.Hubs;
using VstepWritingLab.Business.DTOs;
using VstepWritingLab.Business.Events;
using VstepWritingLab.Business.Interfaces;
using VstepWritingLab.Business.UseCases;
using VstepWritingLab.Domain.Entities;
using VstepWritingLab.Domain.Interfaces;
using VstepWritingLab.Domain.ValueObjects;

namespace VstepWritingLab.API.Consumers;

/// <summary>
/// Phase 2 Consumer: Parses deeper details (corrections, feedback, roadmap), 
/// updates GradingResult, and notifies frontend that full grading is complete.
/// </summary>
public class GradeEssayDetailsConsumer(
    IGradingAiService         aiService,
    IGradingResultRepository  repository,
    IExamPromptRepository     promptRepository,
    IExamSessionRepository    sessionRepository,
    IProgressUseCase          progressUseCase,
    IHubContext<GradingHub>   hubContext,
    ILogger<GradeEssayDetailsConsumer> logger) : IConsumer<GradeEssayDetailsMessage>
{
    public async Task Consume(ConsumeContext<GradeEssayDetailsMessage> context)
    {
        var msg = context.Message;
        var resultId = msg.ResultId;
        var cmd = msg.Command;

        logger.LogInformation("Phase2 Consumer: processing deep analysis for ResultId={ResultId}", resultId);

        try
        {
            var existing = await repository.GetByIdAsync(resultId);
            if (existing == null)
            {
                logger.LogWarning("Phase2 Consumer: Could not find existing GradingResult {ResultId}. Re-throwing to retry.", resultId);
                throw new Exception("GradingResult not found for Phase 2");
            }
            if (existing.Status == "Completed")
            {
                logger.LogInformation("Phase2 Consumer: ResultId={ResultId} already fully completed, skipping.", resultId);
                return;
            }

            var domainHistory = cmd.UserHistory == null ? null : new VstepWritingLab.Domain.ValueObjects.UserHistory(
                cmd.UserHistory.Weaknesses,
                cmd.UserHistory.PastScores,
                cmd.UserHistory.Level);

            using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(150));
            using var linkedCts = CancellationTokenSource.CreateLinkedTokenSource(context.CancellationToken, cts.Token);

            var aiResult = await aiService.GradePhase2Async(
                msg.RubricContext, cmd.TaskType, cmd.Prompt,
                msg.Exam.KeyPoints, cmd.WordCount, cmd.EssayText,
                cmd.Mode, domainHistory, cmd.Language ?? "vi", linkedCts.Token);

            if (!aiResult.IsSuccess || aiResult.Value == null)
            {
                logger.LogError("AI Phase2 Grading failed for {ResultId}: {Error}", resultId, aiResult.Error);
                throw new Exception($"AI Error Phase2: {aiResult.Error}");
            }

            var ai = aiResult.Value;

            // Merge Phase 2 into existing Result
            existing.UpdatePhase2Details(
                ai.StrengthsEn, ai.StrengthsVi, ai.ImprovementsEn, ai.ImprovementsVi,
                ai.Corrections, ai.InlineHighlights, ai.RecommendedStructures,
                ai.RewriteSamples, ai.Roadmap, ai.SentenceFeedback, ai.ImprovementTracking
            );

            await repository.SaveAsync(existing, context.CancellationToken);
            await promptRepository.IncrementUsageAsync(cmd.EssayId, context.CancellationToken);

            var activeSession = await sessionRepository.GetActiveSessionAsync(cmd.StudentId, cmd.EssayId, context.CancellationToken);
            if (activeSession != null)
            {
                activeSession.Status = ExamSessionStatus.Completed;
                activeSession.LastUpdatedAt = DateTime.UtcNow;
                await sessionRepository.UpdateAsync(activeSession, context.CancellationToken);
            }

            if (cmd.Mode == "exam")
                await progressUseCase.UpdateAsync(cmd.StudentId);

            logger.LogInformation("Phase2 Consumer: grading fully completed for ResultId={ResultId}", resultId);

            // Notify frontend
            await NotifyClient(cmd.StudentId, resultId, "GradingCompleted", "completed");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled exception in GradeEssayDetailsConsumer for {ResultId} (Attempt: {Attempt})", resultId, context.GetRetryAttempt());
            if (context.GetRetryAttempt() >= 3)
            {
                var existing = await repository.GetByIdAsync(resultId);
                if (existing != null)
                {
                    existing.MarkAsFailed("Hoàn thành điểm số nhưng không thể tải phân tích chi tiết (AI Timeout).");
                    await repository.SaveAsync(existing, default);
                }
                
                await NotifyClient(cmd.StudentId, resultId, "GradingFailed", "failed");
            }
            throw;
        }
    }

    private Task NotifyClient(string userId, string resultId, string method, string status)
    {
        return hubContext.Clients.Group(userId)
            .SendAsync(method, new { resultId, status });
    }
}
