using System.Linq;
using VstepWritingLab.Domain.Interfaces;
using VstepWritingLab.Domain.ValueObjects;

namespace VstepWritingLab.Business.UseCases;

public interface IProgressUseCase
{
    Task<Result<ProgressSummary>> GetUserProgressAsync(string studentId);
    Task UpdateAsync(string studentId);
}

public class ProgressUseCase(
    IProgressRepository repository,
    IGradingResultRepository historyRepo) : IProgressUseCase
{
    public async Task<Result<ProgressSummary>> GetUserProgressAsync(string studentId)
    {
        var progress = await repository.GetAsync(studentId);
        if (progress == null) return Result<ProgressSummary>.Fail("Progress not found");
        return Result<ProgressSummary>.Ok(progress);
    }

    public async Task UpdateAsync(string studentId)
    {
        // 1. Fetch all results
        var results = await historyRepo.GetHistoryAsync(studentId, limit: 100);
        if (results.Count == 0) return;

        // 2. Calculate Averages
        int count = results.Count;
        double avgScore = results.Average(r => r.TotalScore);
        double avgTF    = results.Average(r => r.TaskFulfilment.Score);
        double avgORG   = results.Average(r => r.Organization.Score);
        double avgVOC   = results.Average(r => r.Vocabulary.Score);
        double avgGR    = results.Average(r => r.Grammar.Score);
        double relRate  = results.Count(r => r.Relevance.IsRelevant) * 100.0 / count;

        // 3. Find Strongest/Weakest
        var criteria = new Dictionary<string, double> {
            { "Task Fulfilment", avgTF }, { "Organization", avgORG },
            { "Vocabulary", avgVOC }, { "Grammar", avgGR }
        };
        var strongest = criteria.OrderByDescending(c => c.Value).First().Key;
        var weakest   = criteria.OrderBy(c => c.Value).First().Key;

        // 4. Trend (last 3 vs earlier)
        string trend = "Stable";
        double trendVal = 0;
        if (count >= 4) {
            double latestAvg = results.Take(3).Average(r => r.TotalScore);
            double olderAvg  = results.Skip(3).Take(3).Average(r => r.TotalScore);
            trendVal = latestAvg - olderAvg;
            trend = trendVal > 0.5 ? "Improving" : trendVal < -0.5 ? "Declining" : "Stable";
        }

        // 5. Current CEFR (from latest)
        var latest = results.OrderByDescending(r => r.GradedAt).First();

        var summary = new ProgressSummary(
            count,
            avgScore,
            avgTF,
            avgORG,
            avgVOC,
            avgGR,
            weakest,
            strongest,
            trend,
            trendVal,
            latest.CefrLevel,
            latest.VstepComparison,
            relRate,
            DateTime.UtcNow
        );

        await repository.SaveAsync(studentId, summary);
    }
}
