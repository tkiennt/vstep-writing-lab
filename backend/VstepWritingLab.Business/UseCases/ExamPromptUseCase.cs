using VstepWritingLab.Domain.Entities;
using VstepWritingLab.Domain.Interfaces;
using VstepWritingLab.Domain.ValueObjects;

namespace VstepWritingLab.Business.UseCases;

public interface IExamPromptUseCase
{
    Task<Result<IEnumerable<ExamPrompt>>> GetPromptsByTypeAsync(string taskType);
    Task<Result<ExamPrompt>> GetByIdAsync(string id);
}

public class ExamPromptUseCase(IExamPromptRepository repository) : IExamPromptUseCase
{
    public async Task<Result<IEnumerable<ExamPrompt>>> GetPromptsByTypeAsync(string taskType)
    {
        var prompts = await repository.GetActiveAsync(taskType);
        return Result<IEnumerable<ExamPrompt>>.Ok(prompts);
    }

    public async Task<Result<ExamPrompt>> GetByIdAsync(string id)
    {
        var prompt = await repository.GetByIdAsync(id);
        if (prompt == null) return Result<ExamPrompt>.Fail("Prompt not found");
        return Result<ExamPrompt>.Ok(prompt);
    }
}
