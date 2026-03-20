using System.Threading;
using System.Threading.Tasks;
using VstepWritingLab.Domain.Entities;

namespace VstepWritingLab.Domain.Interfaces;

public interface IExamSessionRepository
{
    Task<ExamSession?> GetByIdAsync(string id, CancellationToken ct = default);
    Task<ExamSession?> GetActiveSessionAsync(string userId, string examId, CancellationToken ct = default);
    Task<string> CreateAsync(ExamSession session, CancellationToken ct = default);
    Task UpdateAsync(ExamSession session, CancellationToken ct = default);
}
