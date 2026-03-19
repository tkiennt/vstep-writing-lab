using VstepWritingLab.Domain.Interfaces;
using VstepWritingLab.Domain.ValueObjects;

namespace VstepWritingLab.Business.UseCases;

public interface IProgressUseCase
{
    Task<Result<ProgressSummary>> GetUserProgressAsync(string studentId);
}

public class ProgressUseCase(IProgressRepository repository) : IProgressUseCase
{
    public async Task<Result<ProgressSummary>> GetUserProgressAsync(string studentId)
    {
        var progress = await repository.GetAsync(studentId);
        if (progress == null) return Result<ProgressSummary>.Fail("Progress not found");
        return Result<ProgressSummary>.Ok(progress);
    }
}
