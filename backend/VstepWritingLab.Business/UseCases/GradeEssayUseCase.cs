using VstepWritingLab.Domain.Entities;
using VstepWritingLab.Domain.Interfaces;
using VstepWritingLab.Domain.ValueObjects;
using VstepWritingLab.Business.DTOs;

namespace VstepWritingLab.Business.UseCases;

public interface IGradeEssayUseCase
{
    Task<Result<GradingResultDto>> ExecuteAsync(GradeEssayRequest request);
}

public class GradeEssayUseCase(
    IGradingResultRepository repository,
    IGradingAiService aiService,
    IExamPromptRepository promptRepository,
    IRubricContextService rubricService) : IGradeEssayUseCase
{
    public async Task<Result<GradingResultDto>> ExecuteAsync(GradeEssayRequest request)
    {
        // 1. Get Prompt
        var prompt = await promptRepository.GetByIdAsync(request.PromptId);
        if (prompt == null) return Result<GradingResultDto>.Fail("Prompt not found");

        // 2. Get Rubric Context
        var context = await rubricService.GetContextAsync(request.Content, request.TaskType);

        // 3. Call AI Service
        var aiResult = await aiService.GradeAsync(
            context, request.TaskType, prompt.Instruction,
            prompt.KeyPoints, request.Content.Split(' ').Length, request.Content);

        if (!aiResult.IsSuccess || aiResult.Value == null) 
            return Result<GradingResultDto>.Fail(aiResult.Error ?? "AI grading failed");
        
        var aiOutput = aiResult.Value;

        // 4. Create Domain Entity (Types already match from AiGradingOutput)
        var gradingResult = new GradingResult(
            Guid.NewGuid().ToString(),
            request.UserUid,
            request.PromptId,
            request.TaskType,
            DateTime.UtcNow,
            aiOutput.Relevance,
            aiOutput.TaskFulfilment,
            aiOutput.Organization,
            aiOutput.Vocabulary,
            aiOutput.Grammar,
            aiOutput.StrengthsVi,
            aiOutput.ImprovementsVi,
            aiOutput.Corrections,
            aiOutput.AiModel
        );

        // 5. Persist
        await repository.SaveAsync(gradingResult, request.Content, request.Content.Split(' ').Length);

        // 6. Map to DTO
        var feedback = aiOutput.StrengthsVi.Length > 0 ? aiOutput.StrengthsVi[0] : "Grading complete";

        return Result<GradingResultDto>.Ok(new GradingResultDto(
            gradingResult.Id,
            gradingResult.StudentId,
            gradingResult.ExamId,
            gradingResult.TotalScore,
            gradingResult.CefrLevel,
            feedback,
            gradingResult.GradedAt
        ));
    }
}
