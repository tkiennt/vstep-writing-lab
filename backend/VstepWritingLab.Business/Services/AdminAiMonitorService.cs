using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VstepWritingLab.Business.Interfaces;
using VstepWritingLab.Shared.Models.Entities;

namespace VstepWritingLab.Business.Services
{
    public class AdminAiMonitorService
    {
        private readonly IAiUsageLogRepository _aiLogRepo;

        public AdminAiMonitorService(IAiUsageLogRepository aiLogRepo)
        {
            _aiLogRepo = aiLogRepo;
        }

        public async Task<List<AiLogResponse>> GetRecentLogsAsync(int count = 50)
        {
            var now = DateTime.UtcNow;
            var past = now.AddDays(-7);
            var logs = await _aiLogRepo.GetByDateRangeAsync(past, now);
            
            return logs.OrderByDescending(l => l.CreatedAt.ToDateTime())
                       .Take(count)
                       .Select(l => new AiLogResponse
                       {
                           LogId = l.LogId,
                           SubmissionId = l.SubmissionId,
                           UserId = l.UserId,
                           Model = l.Model,
                           PromptTokens = l.PromptTokens,
                           CompletionTokens = l.CompletionTokens,
                           TotalTokens = l.TotalTokens,
                           LatencyMs = l.LatencyMs,
                           Status = l.Status,
                           ErrorMessage = l.ErrorMessage,
                           CreatedAt = l.CreatedAt.ToDateTime()
                       }).ToList();
        }

        public async Task<AiStatsResponse> GetUsageStatsAsync()
        {
            var now = DateTime.UtcNow;
            var past = now.AddDays(-30);
            var logs = await _aiLogRepo.GetByDateRangeAsync(past, now);

            if (!logs.Any()) return new AiStatsResponse();

            return new AiStatsResponse
            {
                TotalCalls = logs.Count,
                AverageLatencyMs = (int)logs.Average(l => l.LatencyMs),
                TotalTokens = logs.Sum(l => l.TotalTokens),
                ErrorCount = logs.Count(l => l.Status == "error"),
                ModelUsage = logs.GroupBy(l => l.Model)
                                 .ToDictionary(g => g.Key, g => g.Count())
            };
        }
    }

    public class AiLogResponse
    {
        public string LogId { get; set; }
        public string SubmissionId { get; set; }
        public string UserId { get; set; }
        public string Model { get; set; }
        public int PromptTokens { get; set; }
        public int CompletionTokens { get; set; }
        public int TotalTokens { get; set; }
        public int LatencyMs { get; set; }
        public string Status { get; set; }
        public string ErrorMessage { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class AiStatsResponse
    {
        public int TotalCalls { get; set; }
        public int AverageLatencyMs { get; set; }
        public long TotalTokens { get; set; }
        public int ErrorCount { get; set; }
        public Dictionary<string, int> ModelUsage { get; set; } = new();
    }
}
