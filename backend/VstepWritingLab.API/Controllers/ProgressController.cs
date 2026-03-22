using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using VstepWritingLab.API.Helpers;
using VstepWritingLab.Business.Services;
using VstepWritingLab.Business.UseCases;
using VstepWritingLab.Domain.Interfaces;
using System.Linq;
using System.Collections.Generic;

namespace VstepWritingLab.API.Controllers
{
    [ApiController]
    [Route("api/progress")]
    [Authorize]
    public class ProgressController(
        IProgressUseCase useCase,
        IGradingResultRepository historyRepo) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var uid    = this.GetUserId();
            var result = await useCase.GetUserProgressAsync(uid);
            
            if (!result.IsSuccess)
            {
                // Return empty stats for new users instead of 404
                return Ok(new
                {
                    totalEssays = 0,
                    weightedOverallScore = 0.0,
                    averageScoreTask1 = 0.0,
                    averageScoreTask2 = 0.0,
                    streak = 0,
                    scoreHistory = new List<object>(),
                    averageBySkill = new Dictionary<string, double> {
                        { "taskFulfilment", 0 }, { "organization", 0 },
                        { "vocabulary", 0 }, { "grammar", 0 }
                    },
                    weakSkills = new List<string>(),
                    lastUpdatedAt = DateTime.UtcNow
                });
            }

            var p = result.Value!;
            
            // Fetch history for the chart (last 7 scores)
            var history = await historyRepo.GetHistoryAsync(uid, limit: 7);
            var scoreHistory = history.Select(h => new
            {
                date  = h.GradedAt.ToString("yyyy-MM-dd"),
                score = h.TotalScore
            }).Reverse().ToList(); // Reverse for chronological order on chart

            // Map ProgressSummary to the DTO the Dashboard expects (ProgressResponse)
            return Ok(new
            {
                totalEssays          = p.TotalSubmissions,
                weightedOverallScore = p.AvgScore,
                averageScoreTask1    = p.AvgScore, // New architect doesn't split by task yet
                averageScoreTask2    = p.AvgScore,
                streak               = 1, // Placeholder
                scoreHistory         = scoreHistory,
                averageBySkill       = new Dictionary<string, double>
                {
                    { "taskFulfilment", p.AvgTaskFulfilment },
                    { "organization",   p.AvgOrganization },
                    { "vocabulary",     p.AvgVocabulary },
                    { "grammar",        p.AvgGrammar }
                },
                weakSkills    = new List<string> { p.WeakestCriterion },
                lastUpdatedAt = p.LastUpdated
            });
        }
    }
}
