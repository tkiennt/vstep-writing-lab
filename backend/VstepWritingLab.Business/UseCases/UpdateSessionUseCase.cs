using System;
using System.Threading;
using System.Threading.Tasks;
using VstepWritingLab.Domain.Entities;
using VstepWritingLab.Domain.Interfaces;
using VstepWritingLab.Domain.ValueObjects;
using VstepWritingLab.Business.DTOs;

namespace VstepWritingLab.Business.UseCases;

public interface IUpdateSessionUseCase
{
    Task<Result<ExamSessionDto>> ExecuteAsync(string userId, string sessionId, UpdateSessionRequest request, CancellationToken ct = default);
}

public class UpdateSessionUseCase(IExamSessionRepository repository) : IUpdateSessionUseCase
{
    public async Task<Result<ExamSessionDto>> ExecuteAsync(string userId, string sessionId, UpdateSessionRequest request, CancellationToken ct = default)
    {
        var session = await repository.GetByIdAsync(sessionId, ct);
        if (session == null)
            return Result<ExamSessionDto>.Fail("Session not found");

        if (session.UserId != userId)
            return Result<ExamSessionDto>.Fail("Unauthorized access to session");

        if (request.EssayText != null)
            session.EssayText = request.EssayText;

        if (request.ExitCount.HasValue)
            session.ExitCount += request.ExitCount.Value;

        if (request.Status != null && Enum.TryParse<ExamSessionStatus>(request.Status, out var newStatus))
            session.Status = newStatus;

        session.LastUpdatedAt = DateTime.UtcNow;

        await repository.UpdateAsync(session, ct);

        return Result<ExamSessionDto>.Ok(new ExamSessionDto(
            session.Id, session.UserId, session.ExamId, session.TaskType, 
            session.StartTime, session.LastUpdatedAt, session.EssayText, 
            session.Status.ToString(), session.ExitCount
        ));
    }
}
