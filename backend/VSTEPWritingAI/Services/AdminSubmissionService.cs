using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VSTEPWritingAI.Exceptions;
using VSTEPWritingAI.Models.DTOs.Responses;
using VSTEPWritingAI.Models.Firestore;
using VSTEPWritingAI.Repositories;

namespace VSTEPWritingAI.Services
{
    public class AdminSubmissionService
    {
        private readonly SubmissionRepository _submissionRepo;
        private readonly UserRepository _userRepo;
        private readonly QuestionRepository _questionRepo;

        public AdminSubmissionService(
            SubmissionRepository submissionRepo,
            UserRepository userRepo,
            QuestionRepository questionRepo)
        {
            _submissionRepo = submissionRepo;
            _userRepo = userRepo;
            _questionRepo = questionRepo;
        }

        public async Task<List<AdminSubmissionListItemResponse>> GetAllSubmissionsAsync(
            string? status = null,
            string? taskType = null,
            string? userId = null,
            DateTime? from = null,
            DateTime? to = null,
            int limit = 50)
        {
            var submissions = await _submissionRepo.SearchAsync(status, taskType, userId, from, to, limit);

            // Fetch user info for emails
            var userIds = submissions.Select(s => s.UserId).Distinct().ToList();
            var userMap = new Dictionary<string, UserModel>();
            foreach (var uid in userIds)
            {
                var user = await _userRepo.GetByIdAsync(uid);
                if (user != null) userMap[uid] = user;
            }

            // Fetch question titles
            var questionIds = submissions.Select(s => s.QuestionId).Distinct().ToList();
            var questionMap = new Dictionary<string, string>();
            foreach (var qid in questionIds)
            {
                var q = await _questionRepo.GetByIdAsync(qid);
                if (q != null) questionMap[qid] = q.Title;
            }

            return submissions.Select(s => new AdminSubmissionListItemResponse
            {
                SubmissionId  = s.SubmissionId,
                UserId        = s.UserId,
                UserEmail     = userMap.GetValueOrDefault(s.UserId)?.Email ?? "Unknown",
                QuestionTitle = questionMap.GetValueOrDefault(s.QuestionId, "Unknown"),
                TaskType      = s.TaskType,
                Mode          = s.Mode,
                WordCount     = s.WordCount,
                Status        = s.Status,
                OverallScore  = s.AiScore?.Overall,
                RetryCount    = s.RetryCount,
                CreatedAt     = s.CreatedAt.ToDateTime(),
                ScoredAt      = s.ScoredAt?.ToDateTime()
            }).ToList();
        }

        public async Task<AdminSubmissionDetailResponse> GetSubmissionDetailAsync(string submissionId)
        {
            var s = await _submissionRepo.GetByIdAsync(submissionId);
            if (s == null)
                throw new NotFoundException($"Submission {submissionId} not found");

            var user = await _userRepo.GetByIdAsync(s.UserId);
            var question = await _questionRepo.GetByIdAsync(s.QuestionId);

            return new AdminSubmissionDetailResponse
            {
                SubmissionId  = s.SubmissionId,
                UserId        = s.UserId,
                UserEmail     = user?.Email ?? "Unknown",
                QuestionId    = s.QuestionId,
                QuestionTitle = question?.Title ?? "Unknown",
                TaskType      = s.TaskType,
                Mode          = s.Mode,
                EssayContent  = s.EssayContent,
                WordCount     = s.WordCount,
                BelowMinWords = s.BelowMinWords,
                Status        = s.Status,
                AiScore = s.AiScore == null ? null : new AiScoreResponse
                {
                    TaskFulfilment = s.AiScore.TaskFulfilment,
                    Organization   = s.AiScore.Organization,
                    Vocabulary     = s.AiScore.Vocabulary,
                    Grammar        = s.AiScore.Grammar,
                    Overall        = s.AiScore.Overall
                },
                AiFeedback = s.AiFeedback == null ? null : new AiFeedbackResponse
                {
                    Summary     = s.AiFeedback.Summary,
                    Suggestions = s.AiFeedback.Suggestions,
                    Highlights  = s.AiFeedback.Highlights?.Select(h => new HighlightResponse
                    {
                        Text  = h.Text,
                        Issue = h.Issue,
                        Type  = h.Type
                    }).ToList()
                },
                RetryCount = s.RetryCount,
                CreatedAt  = s.CreatedAt.ToDateTime(),
                ScoredAt   = s.ScoredAt?.ToDateTime()
            };
        }
    }

    // New DTOs for Admin
    public class AdminSubmissionListItemResponse
    {
        public string SubmissionId { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string UserEmail { get; set; } = string.Empty;
        public string QuestionTitle { get; set; } = string.Empty;
        public string TaskType { get; set; } = string.Empty;
        public string Mode { get; set; } = string.Empty;
        public int WordCount { get; set; }
        public string Status { get; set; } = string.Empty;
        public double? OverallScore { get; set; }
        public int RetryCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ScoredAt { get; set; }
    }

    public class AdminSubmissionDetailResponse : AdminSubmissionListItemResponse
    {
        public string QuestionId { get; set; } = string.Empty;
        public string EssayContent { get; set; } = string.Empty;
        public bool BelowMinWords { get; set; }
        public AiScoreResponse? AiScore { get; set; }
        public AiFeedbackResponse? AiFeedback { get; set; }
    }
}
