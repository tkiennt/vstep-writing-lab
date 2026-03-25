using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VstepWritingLab.Business.Interfaces;
using VstepWritingLab.Shared.Models.Entities;

namespace VstepWritingLab.Business.Services
{
    public class AdminReportsService
    {
        private readonly ISubmissionRepository _submissionRepo;
        private readonly IAiUsageLogRepository _aiLogRepo;

        public AdminReportsService(
            ISubmissionRepository submissionRepo,
            IAiUsageLogRepository aiLogRepo)
        {
            _submissionRepo = submissionRepo;
            _aiLogRepo = aiLogRepo;
        }

        public async Task<List<DailyTrendResponse>> GetDailyTrendsAsync(int days = 30)
        {
            var submissions = await _submissionRepo.GetAllAsync();
            var cutoff = DateTime.UtcNow.AddDays(-days);

            return submissions
                .Where(s => s.CreatedAt.ToDateTime() >= cutoff)
                .GroupBy(s => s.CreatedAt.ToDateTime().Date)
                .Select(g => new DailyTrendResponse
                {
                    Date = g.Key,
                    Count = g.Count(),
                    AvgScore = g.Any(s => s.Status == "scored") 
                        ? Math.Round(g.Where(s => s.Status == "scored").Average(s => s.AiScore?.Overall ?? 0), 2)
                        : 0
                })
                .OrderBy(t => t.Date)
                .ToList();
        }

        public async Task<List<ScoreBucketResponse>> GetScoreDistributionAsync()
        {
            var submissions = await _submissionRepo.GetAllAsync();
            var scored = submissions.Where(s => s.Status == "scored").ToList();

            var buckets = new List<ScoreBucketResponse>();
            for (double i = 0; i <= 9; i += 1.0)
            {
                var label = $"{i}-{i + 1}";
                var count = scored.Count(s => (s.AiScore?.Overall ?? 0) >= i && (s.AiScore?.Overall ?? 0) < i + 1);
                buckets.Add(new ScoreBucketResponse { Label = label, Count = count });
            }

            return buckets;
        }

        public async Task<byte[]> GenerateSubmissionsCsvAsync()
        {
            var submissions = await _submissionRepo.GetAllAsync();
            var csv = new System.Text.StringBuilder();
            csv.AppendLine("SubmissionId,UserId,TaskType,Status,OverallScore,WordCount,CreatedAt");

            foreach (var s in submissions)
            {
                csv.AppendLine($"{s.SubmissionId},{s.UserId},{s.TaskType},{s.Status},{s.AiScore?.Overall ?? 0},{s.WordCount},{s.CreatedAt.ToDateTime():yyyy-MM-dd HH:mm:ss}");
            }

            return System.Text.Encoding.UTF8.GetBytes(csv.ToString());
        }

        public async Task<List<AiUsageTrendResponse>> GetAiUsageTrendsAsync(int days = 30)
        {
            var cutoff = DateTime.UtcNow.AddDays(-days);
            var logs = await _aiLogRepo.GetByDateRangeAsync(cutoff, DateTime.UtcNow);

            return logs
                .GroupBy(l => l.CreatedAt.ToDateTime().Date)
                .Select(g => new AiUsageTrendResponse
                {
                    Date = g.Key,
                    TotalTokens = g.Sum(l => l.TotalTokens),
                    AvgLatencyMs = g.Any() ? (int)g.Average(l => l.LatencyMs) : 0,
                    SuccessRate = g.Any() ? (double)g.Count(l => l.Status == "success") / g.Count() * 100 : 0
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
