using Microsoft.Extensions.Logging;
using VstepWritingLab.Domain.Entities;
using VstepWritingLab.Domain.Interfaces;
using VstepWritingLab.Domain.ValueObjects;
using VstepWritingLab.Business.DTOs;
using System.Threading;
using System.Threading.Tasks;

namespace VstepWritingLab.Business.UseCases;

public interface IGradeEssayUseCase
{
    Task<Result<FullAnalysisResponse>> ExecuteAsync(GradeEssayRequest request, CancellationToken ct = default);
}

public class GradeEssayUseCase(
    IGradingResultRepository repository,
    IGradingAiService aiService,
    IExamPromptRepository promptRepository,
    IRubricContextService rubricService,
    IProgressUseCase progressUseCase,
    ILogger<GradeEssayUseCase> logger) : IGradeEssayUseCase
{
    public async Task<Result<FullAnalysisResponse>> ExecuteAsync(GradeEssayRequest request, CancellationToken ct = default)
    {
        // 1. Load exam + rubric context in parallel
        var examTask   = promptRepository.GetByIdAsync(request.PromptId, ct);
        var rubricTask = rubricService.GetContextAsync(request.Content, request.TaskType, ct);
        
        await Task.WhenAll(examTask, rubricTask);

        var exam = await examTask;
        if (exam is null)
            return Result<FullAnalysisResponse>.Fail($"Exam '{request.PromptId}' not found");

        var rubricContext = await rubricTask;

        // 2. Call AI Service (tuned model with fallback)
        int wordCount = request.Content.Split(new[] { ' ', '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries).Length;
        var aiResult = await aiService.GradeAsync(
            rubricContext, request.TaskType, exam.Instruction,
            exam.KeyPoints, wordCount, request.Content, ct);

        if (!aiResult.IsSuccess || aiResult.Value == null) 
            return Result<FullAnalysisResponse>.Fail(aiResult.Error ?? "AI grading failed");
        
        var ai = aiResult.Value;

        // 3. Create Domain Entity
        var gradingResult = new GradingResult(
            Guid.NewGuid().ToString(),
            request.UserUid,
            request.PromptId,
            request.TaskType,
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
            ai.Roadmap
        );

        // 4. Map to Response DTO
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
            gradingResult.AiModel
        );

        // 5. Save to Firestore + update progress (fire-and-forget)
        _ = Task.Run(async () => {
            try {
                await repository.SaveAsync(gradingResult, request.Content, wordCount);
                await promptRepository.IncrementUsageAsync(request.PromptId);
                await progressUseCase.UpdateAsync(request.UserUid);
            } catch (Exception ex) {
                logger.LogError(ex, "Background save failed for User {StudentId}", request.UserUid);
            }
        });

        return Result<FullAnalysisResponse>.Ok(response);
    }
}
