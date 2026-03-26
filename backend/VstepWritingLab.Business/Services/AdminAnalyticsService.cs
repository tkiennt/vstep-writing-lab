using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VstepWritingLab.Shared.Models.DTOs.Responses;
using SharedAiLogResponse = VstepWritingLab.Shared.Models.DTOs.Responses.AiLogResponse;
using VstepWritingLab.Business.Interfaces;
using VstepWritingLab.Domain.Interfaces;
using VstepWritingLab.Shared.Models.Entities;

namespace VstepWritingLab.Business.Services
{
    public class AdminAnalyticsService
    {
        private readonly ILegacyUserRepository _userRepo;
        private readonly IGradingResultRepository _gradingResultRepo;
        private readonly IExamPromptRepository _examPromptRepo;
        private readonly IAiUsageLogRepository _aiLogRepo;

        public AdminAnalyticsService(
            ILegacyUserRepository userRepo,
            IGradingResultRepository gradingResultRepo,
            IExamPromptRepository examPromptRepo,
            IAiUsageLogRepository aiLogRepo)
        {
            _userRepo          = userRepo;
            _gradingResultRepo = gradingResultRepo;
            _examPromptRepo    = examPromptRepo;
            _aiLogRepo         = aiLogRepo;
        }

        public async Task<AdminAnalyticsResponse> GetAnalyticsAsync()
        {
            var users       = await _userRepo.GetAllAsync();
            var submissions = await _gradingResultRepo.GetAllAsync(1000); // Admin max typical view

            var completed = submissions.Count(s => s.Status == "Completed" || s.Status == "scored");
            var failed    = submissions.Count(s => s.Status == "Error" || s.Status == "failed");
            var pending   = submissions.Count(s => s.Status == "Pending" || s.Status == "processing");

            // Mocking token usage percent and dummy response time based on system limits
            var tokenPercent = 15; // Placeholder
            var avgResponse  = "4.2s";

            // Hourly Stats Map
            var today = DateTime.UtcNow.Date;
            var todaysSubmissions = submissions.Where(s => s.GradedAt.Date == today).ToList();
            var hourlyStatsList = new List<HourlyStatDto>();
            
            for (int i = 0; i < 24; i++)
            {
                var hourStart = today.AddHours(i);
                var hourEnd = hourStart.AddHours(1);
                var subInHour = todaysSubmissions.Where(s => s.GradedAt >= hourStart && s.GradedAt < hourEnd).ToList();
                
                if (todaysSubmissions.Any() || i <= DateTime.UtcNow.Hour)
                {
                    hourlyStatsList.Add(new HourlyStatDto
                    {
                        Hour = $"{i:D2}:00",
                        Submissions = subInHour.Count,
                        Graded = subInHour.Count(s => s.Status == "Completed" || s.Status == "Error")
                    });
                }
            }

            return new AdminAnalyticsResponse
            {
                TotalUsers              = users.Count,
                TotalEssays             = submissions.Count,
                TotalGradedSuccessfully = completed,
                TotalFailed             = failed,
                PendingQueue            = pending,
                AvgResponseTime         = avgResponse,
                TokenUsagePercent       = tokenPercent,
                HourlyStats             = hourlyStatsList
            };
        }

        public async Task<List<SharedAiLogResponse>> GetAiLogsAsync(
            DateTime? from,
            DateTime? to)
        {
            var recentSubmissions = await _gradingResultRepo.GetAllAsync(50);
            var results = new List<SharedAiLogResponse>();

            foreach (var sub in recentSubmissions)
            {
                UserModel? user = null;
                if (!string.IsNullOrEmpty(sub.StudentId))
                    user = await _userRepo.GetByIdAsync(sub.StudentId);

                Domain.Entities.ExamPrompt? prompt = null;
                if (!string.IsNullOrEmpty(sub.ExamId))
                    prompt = await _examPromptRepo.GetByIdAsync(sub.ExamId);

                var statusMap = "PROCESSING";
                if (sub.Status == "Completed" || sub.Status == "scored") statusMap = "GRADED";
                if (sub.Status == "Error" || sub.Status == "failed") statusMap = "FAILED";

                string topicTitle = !string.IsNullOrEmpty(prompt?.TopicKeyword) ? prompt.TopicKeyword : prompt?.Instruction ?? "Unknown Topic";

                results.Add(new SharedAiLogResponse
                {
                    Id           = sub.Id,
                    Timestamp    = sub.GradedAt,
                    UserId       = sub.StudentId,
                    UserName     = user?.DisplayName ?? "Unknown User",
                    TopicTitle   = topicTitle,
                    Status       = statusMap,
                    ErrorMessage = sub.Summary
                });
            }

            return results.OrderByDescending(r => r.Timestamp).ToList();
        }
    }
}
