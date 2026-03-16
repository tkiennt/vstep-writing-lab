using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VSTEPWritingAI.Models.DTOs.Responses;
using VSTEPWritingAI.Repositories;

namespace VSTEPWritingAI.Services
{
    public class AdminAnalyticsService
    {
        private readonly UserRepository _userRepo;
        private readonly SubmissionRepository _submissionRepo;
        private readonly AiUsageLogRepository _aiLogRepo;

        public AdminAnalyticsService(
            UserRepository userRepo,
            SubmissionRepository submissionRepo,
            AiUsageLogRepository aiLogRepo)
        {
            _userRepo       = userRepo;
            _submissionRepo = submissionRepo;
            _aiLogRepo      = aiLogRepo;
        }

        public async Task<AdminAnalyticsResponse> GetAnalyticsAsync()
        {
            var users       = await _userRepo.GetAllAsync();
            var submissions = await _submissionRepo.GetAllAsync();

            var scored = submissions.Where(s => s.Status == "scored").ToList();
            var failed = submissions.Where(s => s.Status == "failed").ToList();

            var avgScore = scored.Any()
                ? Math.Round(scored.Average(s => s.AiScore?.Overall ?? 0), 1)
                : 0;

            var totalTokens = await _aiLogRepo.GetTotalTokensAsync(
                DateTime.UtcNow.AddDays(-30), DateTime.UtcNow);

            return new AdminAnalyticsResponse
            {
                TotalUsers            = users.Count,
                TotalStudents         = users.Count(u => u.Role == "student"),
                TotalSubmissions      = submissions.Count,
                ScoredSubmissions     = scored.Count,
                FailedSubmissions     = failed.Count,
                AverageOverallScore   = avgScore,
                TotalTokensUsed       = totalTokens,
                TotalTask1Submissions = submissions.Count(s => s.TaskType == "task1"),
                TotalTask2Submissions = submissions.Count(s => s.TaskType == "task2"),
                GeneratedAt           = DateTime.UtcNow
            };
        }

        public async Task<List<AiLogResponse>> GetAiLogsAsync(
            DateTime? from,
            DateTime? to)
        {
            var fromDate = from ?? DateTime.UtcNow.AddDays(-30);
            var toDate   = to   ?? DateTime.UtcNow;

            var logs = await _aiLogRepo.GetByDateRangeAsync(fromDate, toDate);

            return logs.Select(l => new AiLogResponse
            {
                LogId             = l.LogId,
                SubmissionId      = l.SubmissionId,
                UserId            = l.UserId,
                Model             = l.Model,
                PromptTokens      = l.PromptTokens,
                CompletionTokens  = l.CompletionTokens,
                TotalTokens       = l.TotalTokens,
                LatencyMs         = l.LatencyMs,
                Status            = l.Status,
                ErrorMessage      = l.ErrorMessage,
                CreatedAt         = l.CreatedAt.ToDateTime()
            }).ToList();
        }
    }
}
