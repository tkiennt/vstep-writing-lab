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
    Task<Result<FullAnalysisResponse>> ExecuteAsync(GradeEssayCommand command, CancellationToken ct = default);
}

public class GradeEssayUseCase(
    IGradingResultRepository repository,
    IGradingAiService aiService,
    IExamPromptRepository promptRepository,
    IRubricContextService rubricService,
    IProgressUseCase progressUseCase,
    ILogger<GradeEssayUseCase> logger) : IGradeEssayUseCase
{
    public async Task<Result<FullAnalysisResponse>> ExecuteAsync(GradeEssayCommand command, CancellationToken ct = default)
    {
        // 1. Load exam + rubric context in parallel
        var examTask   = promptRepository.GetByIdAsync(command.EssayId, ct);
        var rubricTask = rubricService.GetContextAsync(command.EssayText, command.TaskType, ct);
        
        await Task.WhenAll(examTask, rubricTask);

        var exam = await examTask;
        if (exam is null)
            return Result<FullAnalysisResponse>.Fail($"Exam '{command.EssayId}' not found");

        var rubricContext = await rubricTask;

        // 2. Call AI Service (tuned model with fallback)
        var aiResult = await aiService.GradeAsync(
            rubricContext, command.TaskType, command.Prompt,
            exam.KeyPoints, command.WordCount, command.EssayText, ct);

        if (!aiResult.IsSuccess || aiResult.Value == null) 
            return Result<FullAnalysisResponse>.Fail(aiResult.Error ?? "AI grading failed");
        
        var ai = aiResult.Value;

        // 3. Create Domain Entity
        var gradingResult = new GradingResult(
            Guid.NewGuid().ToString(),
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
                await repository.SaveAsync(gradingResult, command.EssayText, command.WordCount);
                await promptRepository.IncrementUsageAsync(command.EssayId);
                await progressUseCase.UpdateAsync(command.StudentId);
            } catch (Exception ex) {
                logger.LogError(ex, "Background save failed for User {StudentId}", command.StudentId);
            }
        });

        return Result<FullAnalysisResponse>.Ok(response);
    }
}
