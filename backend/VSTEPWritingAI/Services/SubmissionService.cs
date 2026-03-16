using Google.Cloud.Firestore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VSTEPWritingAI.Exceptions;
using VSTEPWritingAI.Models.DTOs.Requests;
using VSTEPWritingAI.Models.DTOs.Responses;
using VSTEPWritingAI.Models.Firestore;
using VSTEPWritingAI.Repositories;

namespace VSTEPWritingAI.Services
{
    public class SubmissionService
    {
        private readonly SubmissionRepository _submissionRepo;
        private readonly QuestionRepository _questionRepo;
        private readonly TaskRepository _taskRepo;
        private readonly AiGradingService _aiGradingService;
        private readonly ProgressService _progressService;
        private readonly ILogger<SubmissionService> _logger;

        public SubmissionService(
            SubmissionRepository submissionRepo,
            QuestionRepository questionRepo,
            TaskRepository taskRepo,
            AiGradingService aiGradingService,
            ProgressService progressService,
            ILogger<SubmissionService> logger)
        {
            _submissionRepo   = submissionRepo;
            _questionRepo     = questionRepo;
            _taskRepo         = taskRepo;
            _aiGradingService = aiGradingService;
            _progressService  = progressService;
            _logger           = logger;
        }

        public async Task<SubmissionResponse> SubmitEssayAsync(
            string userId,
            SubmitEssayRequest request)
        {
            // 1. Validate question exists and is active
            var question = await _questionRepo.GetByIdAsync(request.QuestionId);
            if (question == null || !question.IsActive)
                throw new NotFoundException(
                    $"Question {request.QuestionId} not found");

            // 2. Validate mode
            if (request.Mode != "practice" && request.Mode != "guided")
                throw new ValidationException(
                    new List<string> { "Mode must be 'practice' or 'guided'" });

            // 3. Validate essay content
            if (string.IsNullOrWhiteSpace(request.EssayContent))
                throw new ValidationException(
                    new List<string> { "Essay content cannot be empty" });

            // 4. Count words and check minimum
            var task = await _taskRepo.GetByIdAsync(question.TaskType);
            var wordCount   = CountWords(request.EssayContent);
            var belowMin    = task != null && wordCount < task.MinWords;

            // 5. Create submission with status = "pending"
            var submission = new SubmissionModel
            {
                UserId       = userId,
                QuestionId   = request.QuestionId,
                TaskType     = question.TaskType,
                Mode         = request.Mode,
                EssayContent = request.EssayContent.Trim(),
                WordCount    = wordCount,
                BelowMinWords = belowMin,
                Status       = "pending",
                RetryCount   = 0,
                CreatedAt    = Timestamp.GetCurrentTimestamp()
            };

            var submissionId = await _submissionRepo.CreateAsync(submission);
            submission.SubmissionId = submissionId;

            // 6. Call AI grading (async, updates submission when done)
            _ = GradeAndUpdateAsync(submission, question, task);

            // 7. Return immediately with "pending" status
            return MapToResponse(submission);
        }

        // Runs in background after submission is created
        private async Task GradeAndUpdateAsync(
            SubmissionModel submission,
            QuestionModel question,
            TaskModel task)
        {
            try
            {
                var result = await _aiGradingService.GradeAsync(
                    submission, question, task);

                await _submissionRepo.UpdateStatusAsync(
                    submission.SubmissionId,
                    "scored",
                    result.Score,
                    result.Feedback);

                // Update progress after successful grading
                await _progressService.UpdateAfterSubmissionAsync(
                    submission.UserId,
                    submission.TaskType,
                    result.Score);

                _logger.LogInformation(
                    "Submission {Id} graded. Overall: {Score}",
                    submission.SubmissionId, result.Score.Overall);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Grading failed for submission {Id}", submission.SubmissionId);

                await _submissionRepo.UpdateStatusAsync(
                    submission.SubmissionId, "failed");
            }
        }

        public async Task<SubmissionResponse> RetryAsync(
            string userId,
            string submissionId)
        {
            var submission = await _submissionRepo.GetByIdAsync(submissionId);

            if (submission == null)
                throw new NotFoundException($"Submission {submissionId} not found");

            if (submission.UserId != userId)
                throw new ForbiddenException("Cannot access this submission");

            if (submission.Status != "failed")
                throw new ValidationException(
                    new List<string> { "Only failed submissions can be retried" });

            if (submission.RetryCount >= 3)
                throw new ValidationException(
                    new List<string> { "Maximum retry limit (3) reached" });

            // Increment retry count and reset to pending
            await _submissionRepo.UpdateAsync(submissionId, new Dictionary<string, object>
            {
                { "Status",     "pending" },
                { "RetryCount", submission.RetryCount + 1 }
            });

            submission.Status     = "pending";
            submission.RetryCount += 1;

            var question = await _questionRepo.GetByIdAsync(submission.QuestionId);
            var task     = await _taskRepo.GetByIdAsync(submission.TaskType);

            _ = GradeAndUpdateAsync(submission, question, task);

            return MapToResponse(submission);
        }

        public async Task<List<SubmissionListItemResponse>> GetHistoryAsync(
            string userId,
            int limit = 20)
        {
            var submissions = await _submissionRepo.GetByUserIdAsync(userId, limit);

            // Batch-load question titles for display
            var questionIds = submissions
                .Select(s => s.QuestionId)
                .Distinct()
                .ToList();

            var questionTitles = new Dictionary<string, string>();
            foreach (var qId in questionIds)
            {
                var q = await _questionRepo.GetByIdAsync(qId);
                if (q != null) questionTitles[qId] = q.Title;
            }

            return submissions.Select(s => new SubmissionListItemResponse
            {
                SubmissionId  = s.SubmissionId,
                QuestionId    = s.QuestionId,
                QuestionTitle = questionTitles.GetValueOrDefault(s.QuestionId, ""),
                TaskType      = s.TaskType,
                Mode          = s.Mode,
                WordCount     = s.WordCount,
                BelowMinWords = s.BelowMinWords,
                Status        = s.Status,
                OverallScore  = s.AiScore?.Overall,
                CreatedAt     = s.CreatedAt.ToDateTime()
            }).ToList();
        }

        public async Task<SubmissionResponse> GetByIdAsync(
            string userId,
            string submissionId)
        {
            var submission = await _submissionRepo.GetByIdAsync(submissionId);

            if (submission == null)
                throw new NotFoundException($"Submission {submissionId} not found");

            if (submission.UserId != userId)
                throw new ForbiddenException("Cannot access this submission");

            return MapToResponse(submission);
        }

        // ── Helpers ───────────────────────────────────────────────────────────

        private int CountWords(string text) =>
            text.Split(new[] { ' ', '\n', '\r', '\t' },
                StringSplitOptions.RemoveEmptyEntries).Length;

        private SubmissionResponse MapToResponse(SubmissionModel s) =>
            new SubmissionResponse
            {
                SubmissionId  = s.SubmissionId,
                QuestionId    = s.QuestionId,
                TaskType      = s.TaskType,
                Mode          = s.Mode,
                EssayContent  = s.EssayContent,
                WordCount     = s.WordCount,
                BelowMinWords = s.BelowMinWords,
                Status        = s.Status,
                AiScore       = s.AiScore == null ? null : new AiScoreResponse
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
                    Highlights  = s.AiFeedback.Highlights?.Select(h =>
                        new HighlightResponse
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
