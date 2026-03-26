using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VstepWritingLab.Business.Interfaces;
using VstepWritingLab.Shared.Models.Entities;

using VstepWritingLab.Domain.Interfaces;

namespace VstepWritingLab.Business.Services
{
    public class AdminReportsService
    {
        private readonly IGradingResultRepository _gradingResultRepo;
        private readonly IAiUsageLogRepository _aiLogRepo;

        public AdminReportsService(
            IGradingResultRepository gradingResultRepo,
            IAiUsageLogRepository aiLogRepo)
        {
            _gradingResultRepo = gradingResultRepo;
            _aiLogRepo = aiLogRepo;
        }

        public async Task<List<DailyTrendResponse>> GetDailyTrendsAsync(int days = 30)
        {
            var submissions = await _gradingResultRepo.GetAllAsync(5000);
            var cutoff = DateTime.UtcNow.AddDays(-days);

            return submissions
                .Where(s => s.GradedAt >= cutoff)
                .GroupBy(s => s.GradedAt.Date)
                .Select(g => new DailyTrendResponse
                {
                    Date = g.Key,
                    Count = g.Count(),
                    AvgScore = g.Any(s => s.Status == "Completed" || s.Status == "scored") 
                        ? Math.Round(g.Where(s => s.Status == "Completed" || s.Status == "scored")
                                      .Average(s => s.TotalScore), 2)
                        : 0
                })
                .OrderBy(t => t.Date)
                .ToList();
        }

        public async Task<List<ScoreBucketResponse>> GetScoreDistributionAsync()
        {
            var submissions = await _gradingResultRepo.GetAllAsync(5000);
            var scored = submissions.Where(s => s.Status == "Completed" || s.Status == "scored").ToList();

            var buckets = new List<ScoreBucketResponse>();
            for (double i = 0; i <= 9; i += 1.0)
            {
                var label = $"{i}-{i + 1}";
                var count = scored.Count(s => s.TotalScore >= i && s.TotalScore < i + 1);
                buckets.Add(new ScoreBucketResponse { Label = label, Count = count });
            }

            return buckets;
        }

        public async Task<byte[]> GenerateSubmissionsCsvAsync()
        {
            var submissions = await _gradingResultRepo.GetAllAsync(5000);
            var csv = new System.Text.StringBuilder();
            csv.AppendLine("SubmissionId,StudentId,ExamId,Status,OverallScore,WordCount,GradedAt");

            foreach (var s in submissions)
            {
                csv.AppendLine($"{s.Id},{s.StudentId},{s.ExamId},{s.Status},{s.TotalScore},{s.WordCount},{s.GradedAt:yyyy-MM-dd HH:mm:ss}");
            }

            return System.Text.Encoding.UTF8.GetBytes(csv.ToString());
        }

        public async Task<List<AiUsageTrendResponse>> GetAiUsageTrendsAsync(int days = 30)
        {
            var submissions = await _gradingResultRepo.GetAllAsync(5000);
            var cutoff = DateTime.UtcNow.AddDays(-days);

            return submissions
                .Where(s => s.GradedAt >= cutoff)
                .GroupBy(s => s.GradedAt.Date)
                .Select(g => new AiUsageTrendResponse
                {
                    Date = g.Key,
                    // Mocking total tokens based on word count
                    TotalTokens = (long)g.Sum(s => s.WordCount * 1.5), 
                    // Mocking latency based on avg word counts
                    AvgLatencyMs = g.Any() ? (int)g.Average(s => s.WordCount * 22) : 0, 
                    // Success rate based on NOT failed
                    SuccessRate = g.Any() ? (double)g.Count(s => s.Status != "Error" && s.Status != "failed") / g.Count() * 100 : 0
                })
                .OrderBy(t => t.Date)
                .ToList();
        }
    }

    public class DailyTrendResponse
    {
        public DateTime Date { get; set; }
        public int Count { get; set; }
        public double AvgScore { get; set; }
    }

    public class ScoreBucketResponse
    {
        public string Label { get; set; }
        public int Count { get; set; }
    }

    public class AiUsageTrendResponse
    {
        public DateTime Date { get; set; }
        public long TotalTokens { get; set; }
        public int AvgLatencyMs { get; set; }
        public double SuccessRate { get; set; }
    }
}
