using System;
using System.Threading;
using System.Threading.Tasks;
using VstepWritingLab.Domain.Entities;
using VstepWritingLab.Domain.Interfaces;
using VstepWritingLab.Domain.ValueObjects;
using VstepWritingLab.Business.DTOs;

namespace VstepWritingLab.Business.UseCases;

public interface IStartSessionUseCase
{
    Task<Result<ExamSessionDto>> ExecuteAsync(string userId, StartSessionRequest request, CancellationToken ct = default);
}

public class StartSessionUseCase(IExamSessionRepository repository) : IStartSessionUseCase
{
    public async Task<Result<ExamSessionDto>> ExecuteAsync(string userId, StartSessionRequest request, CancellationToken ct = default)
    {
        // Check for existing active session
        var existing = await repository.GetActiveSessionAsync(userId, request.ExamId, ct);
        if (existing != null)
        {
            return Result<ExamSessionDto>.Ok(MapToDto(existing));
        }

        // Create new session
        var session = new ExamSession
        {
            Id = Guid.NewGuid().ToString(),
            UserId = userId,
            ExamId = request.ExamId,
            TaskType = request.TaskType,
            StartTime = DateTime.UtcNow,
            LastUpdatedAt = DateTime.UtcNow,
            EssayText = string.Empty,
            Status = ExamSessionStatus.InProgress,
            ExitCount = 0
        };

        var id = await repository.CreateAsync(session, ct);
        session.Id = id;

        return Result<ExamSessionDto>.Ok(MapToDto(session));
    }

    private static ExamSessionDto MapToDto(ExamSession s) => new(
        s.Id, s.UserId, s.ExamId, s.TaskType, s.StartTime, s.LastUpdatedAt, s.EssayText, s.Status.ToString(), s.ExitCount
    );
}
