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
/// MassTransit consumer that picks up GradeEssayMessage from RabbitMQ,
/// calls the AI service, saves the result, and notifies the frontend via SignalR.
/// </summary>
public class GradeEssayConsumer(
    IGradingAiService      aiService,
    IGradingResultRepository  repository,
    IExamPromptRepository   promptRepository,
    IExamSessionRepository  sessionRepository,
    IProgressUseCase        progressUseCase,
    IHubContext<GradingHub> hubContext,
    ILogger<GradeEssayConsumer> logger) : IConsumer<GradeEssayMessage>
{
    public async Task Consume(ConsumeContext<GradeEssayMessage> context)
    {
        var msg      = context.Message;
        var resultId = msg.ResultId;
        var cmd      = msg.Command;

        logger.LogInformation("Consumer: processing grading task for ResultId={ResultId}", resultId);

        try
        {
            // Idempotency check:
            var existing = await repository.GetByIdAsync(resultId);
            if (existing != null && existing.Status == "Completed")
            {
                logger.LogInformation("Consumer: ResultId={ResultId} already completed, skipping.", resultId);
                await NotifyClient(cmd.StudentId, resultId, "GradingCompleted", "completed");
                return;
            }

            var domainHistory = cmd.UserHistory == null ? null : new VstepWritingLab.Domain.ValueObjects.UserHistory(
                cmd.UserHistory.Weaknesses,
                cmd.UserHistory.PastScores,
                cmd.UserHistory.Level);

            // 30-second hard timeout for AI call
            using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(30));
            using var linkedCts = CancellationTokenSource.CreateLinkedTokenSource(context.CancellationToken, cts.Token);

            var aiResult = await aiService.GradeAsync(
                msg.RubricContext, cmd.TaskType, cmd.Prompt,
                msg.Exam.KeyPoints, cmd.WordCount, cmd.EssayText,
                cmd.Mode, domainHistory, cmd.Language ?? "vi", linkedCts.Token);

            if (!aiResult.IsSuccess || aiResult.Value == null)
            {
                logger.LogError("AI Grading failed for {ResultId}: {Error}", resultId, aiResult.Error);
                throw new Exception($"AI Error: {aiResult.Error}");
            }

            var ai = aiResult.Value;

            var completedResult = new GradingResult(
                resultId,
                cmd.StudentId,
                cmd.EssayId,
                cmd.TaskType,
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
                cmd.Mode,
                cmd.EssayText,
                cmd.WordCount,
                "", // Summary is generated per-request, not stored in AiGradingOutput
                "Completed"
            );

            await repository.SaveAsync(completedResult, context.CancellationToken);
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

            logger.LogInformation("Consumer: grading completed for ResultId={ResultId}, Score={Score}",
                resultId, completedResult.TotalScore);

            // Notify frontend via SignalR
            await NotifyClient(cmd.StudentId, resultId, "GradingCompleted", "completed");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled exception in GradeEssayConsumer for {ResultId} (Attempt: {Attempt})", resultId, context.GetRetryAttempt());
            
            // On each failure, notify frontend so they can update UI (e.g. show error or keep spinner)
            // But only MARK as Failed in DB if retries are exhausted (max 3 configured)
            if (context.GetRetryAttempt() >= 3)
            {
                await MarkAsFailed(resultId, cmd, "Lỗi hệ thống khi chấm điểm. AI timeout hoặc không phản hồi.");
                await NotifyClient(cmd.StudentId, resultId, "GradingFailed", "failed");
            }
            else
            {
                // Optional: notify about internal transient error if needed
                await NotifyClient(cmd.StudentId, resultId, "GradingError", "retrying");
            }

            throw; // Let MassTransit handle retry
        }
    }

    private Task NotifyClient(string userId, string resultId, string method, string status)
    {
        return hubContext.Clients.Group(userId)
            .SendAsync(method, new { resultId, status });
    }

    private async Task MarkAsFailed(string resultId, GradeEssayCommand cmd, string summaryMsg)
    {
        var failed = new GradingResult(
            resultId, cmd.StudentId, cmd.EssayId, cmd.TaskType, DateTime.UtcNow,
            new TaskRelevance(true, 10, [], [], []),
            new CriterionScore(0, "N/A", "", "", ""),
            new CriterionScore(0, "N/A", "", "", ""),
            new CriterionScore(0, "N/A", "", "", ""),
            new CriterionScore(0, "N/A", "", "", ""),
            [], [], [], "",
            [], [], [],
            new GradingRoadmap("", "", 0, []),
            [], null,
            cmd.Mode, cmd.EssayText, cmd.WordCount, summaryMsg, "Failed");

        await repository.SaveAsync(failed, default);
    }
}
