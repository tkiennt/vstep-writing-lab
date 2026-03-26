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
/// Phase 1 Consumer: Extracts scores quickly, creates the initial GradingResult, 
/// notifies frontend, and triggers Phase 2 (deep analysis).
/// </summary>
public class GradeEssayScoresConsumer(
    IGradingAiService         aiService,
    IGradingResultRepository  repository,
    IExamSessionRepository    sessionRepository,
    IHubContext<GradingHub>   hubContext,
    ILogger<GradeEssayScoresConsumer> logger) : IConsumer<GradeEssayScoresMessage>
{
    public async Task Consume(ConsumeContext<GradeEssayScoresMessage> context)
    {
        var msg = context.Message;
        var resultId = msg.ResultId;
        var cmd = msg.Command;

        logger.LogInformation("Phase1 Consumer: processing scores for ResultId={ResultId}", resultId);

        try
        {
            var existing = await repository.GetByIdAsync(resultId);
            if (existing != null && (existing.Status == "Phase1Completed" || existing.Status == "Completed"))
            {
                logger.LogInformation("Phase1 Consumer: ResultId={ResultId} already processed, skipping.", resultId);
                return;
            }

            var domainHistory = cmd.UserHistory == null ? null : new VstepWritingLab.Domain.ValueObjects.UserHistory(
                cmd.UserHistory.Weaknesses,
                cmd.UserHistory.PastScores,
                cmd.UserHistory.Level);

            using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(120)); // Increased for slower AI responses
            using var linkedCts = CancellationTokenSource.CreateLinkedTokenSource(context.CancellationToken, cts.Token);

            var aiResult = await aiService.GradePhase1Async(
                msg.RubricContext, cmd.TaskType, cmd.Prompt,
                msg.Exam.KeyPoints, cmd.WordCount, cmd.EssayText,
                cmd.Mode, domainHistory, cmd.Language ?? "vi", linkedCts.Token);

            if (!aiResult.IsSuccess || aiResult.Value == null)
            {
                logger.LogError("AI Phase1 Grading failed for {ResultId}: {Error}", resultId, aiResult.Error);
                throw new Exception($"AI Error Phase1: {aiResult.Error}");
            }

            var ai = aiResult.Value;

            var phase1Result = new GradingResult(
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
                ai.StrengthsEn,
                ai.StrengthsVi,
                ai.ImprovementsEn,
                ai.ImprovementsVi,
                ai.Corrections, // Empty
                ai.AiModel,
                ai.InlineHighlights, // Empty
                ai.RecommendedStructures, // Empty
                ai.RewriteSamples, // Empty
                ai.Roadmap, // Null
                ai.SentenceFeedback, // Empty
                ai.ImprovementTracking, // Null
                cmd.Mode,
                cmd.EssayText,
                cmd.WordCount,
                ai.SummaryEn,
                ai.SummaryVi,
                "Phase1Completed"
            );

            await repository.SaveAsync(phase1Result, context.CancellationToken);

            var activeSession = await sessionRepository.GetActiveSessionAsync(cmd.StudentId, cmd.EssayId, context.CancellationToken);
            if (activeSession != null)
            {
                // Update session but don't mark as completed until Phase 2 is done, just update the date
                activeSession.LastUpdatedAt = DateTime.UtcNow;
                await sessionRepository.UpdateAsync(activeSession, context.CancellationToken);
            }

            logger.LogInformation("Phase1 Consumer: scores completed for ResultId={ResultId}, Score={Score}",
                resultId, phase1Result.TotalScore);

            // Notify frontend
            await NotifyClient(cmd.StudentId, resultId, "GradingScoresReady", "scoring_ready");

            // Publish Phase 2 specifically triggering deep analysis
            await context.Publish(new GradeEssayDetailsMessage(resultId, cmd, msg.Exam, msg.RubricContext), context.CancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogError("Phase1 Consumer handled error for {ResultId}: {Message}", resultId, ex.Message);
            await MarkAsFailed(resultId, cmd, "Hệ thống AI quá tải hoặc gặp lỗi. Vui lòng chấm lại.");
            await NotifyClient(cmd.StudentId, resultId, "GradingFailed", "failed");
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
            [], [], [], [],
            [], "",
            [], [], [],
            new GradingRoadmap("", "", 0, []),
            [], null,
            cmd.Mode, cmd.EssayText, cmd.WordCount, 
            "", summaryMsg,
            "Failed");

        await repository.SaveAsync(failed, default);
    }
}
