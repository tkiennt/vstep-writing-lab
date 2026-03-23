using Google.Cloud.Firestore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VstepWritingLab.Shared.Models.DTOs.Requests;
using VstepWritingLab.Shared.Models.DTOs.Responses;
using VstepWritingLab.Shared.Models.Entities;
using VstepWritingLab.Shared.Models.Common;
using VstepWritingLab.Business.Interfaces;
using VstepWritingLab.Business.UseCases;
using VstepWritingLab.Domain.Interfaces;
using VstepWritingLab.Domain.Entities;
using VstepWritingLab.Domain.ValueObjects;

namespace VstepWritingLab.Business.Services
{
    public class SubmissionService
    {
        private readonly IGradingResultRepository _historyRepo;
        private readonly IQuestionRepository _questionRepo;
        private readonly ITaskRepository _taskRepo;
        private readonly AiGradingService _aiGradingService;
        private readonly IProgressUseCase _progressUseCase;
        private readonly ILogger<SubmissionService> _logger;

        public SubmissionService(
            IGradingResultRepository historyRepo,
            IQuestionRepository questionRepo,
            ITaskRepository taskRepo,
            AiGradingService aiGradingService,
            IProgressUseCase progressUseCase,
            ILogger<SubmissionService> logger)
        {
            _historyRepo      = historyRepo;
            _questionRepo     = questionRepo;
            _taskRepo         = taskRepo;
            _aiGradingService = aiGradingService;
            _progressUseCase  = progressUseCase;
            _logger           = logger;
        }

        public async Task<SubmissionResponse> SubmitEssayAsync(
            string userId,
            SubmitEssayRequest request)
        {
            var question = await _questionRepo.GetByIdAsync(request.QuestionId);
            if (question == null || !question.IsActive)
                throw new Exception($"Question {request.QuestionId} not found");

            if (request.Mode != "practice" && request.Mode != "guided")
                throw new Exception("Mode must be 'practice' or 'guided'");

            if (string.IsNullOrWhiteSpace(request.EssayContent))
                throw new Exception("Essay content cannot be empty");

            var task = await _taskRepo.GetByIdAsync(question.TaskType);
            if (task == null)
                throw new Exception($"Task type {question.TaskType} not found");

            var wordCount   = CountWords(request.EssayContent);
            var belowMin    = wordCount < task.MinWords;

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
                Language     = request.Language ?? "vi",
                CreatedAt    = Timestamp.GetCurrentTimestamp()
            };

            // var submissionId = await _submissionRepo.CreateAsync(submission);
            // submission.SubmissionId = submissionId;
            submission.SubmissionId = Guid.NewGuid().ToString(); // Use GUID as per user's system B

            _ = GradeAndUpdateAsync(submission, question, task);

            return MapToResponse(submission);
        }

        private async Task GradeAndUpdateAsync(
            SubmissionModel submission,
            QuestionModel question,
            TaskModel task)
        {
            try
            {
                var result = await _aiGradingService.GradeAsync(
                    submission, question, task);

                var aiScore = new AiScoreModel
                {
                    TaskFulfilment = (int)result.Score.TaskFulfilment,
                    Organization = (int)result.Score.Organization,
                    Vocabulary = (int)result.Score.Vocabulary,
                    Grammar = (int)result.Score.Grammar,
                    Overall = result.Score.Overall
                };

                var aiFeedback = new AiFeedbackModel
                {
                    Summary = result.Summary,
                    Suggestions = result.Suggestions,
                    Highlights = result.Annotations.Select(a => new HighlightModel
                    {
                        Text = submission.EssayContent.Substring(
                            Math.Min(a.StartIndex, submission.EssayContent.Length),
                            Math.Min(a.EndIndex - a.StartIndex, submission.EssayContent.Length - a.StartIndex)),
                        Issue = a.Message,
                        Type = a.Type
                    }).ToList()
                };

                var domainResult = new VstepWritingLab.Domain.Entities.GradingResult(
                    submission.SubmissionId,
                    submission.UserId,
                    submission.QuestionId,
                    submission.TaskType,
                    DateTime.UtcNow,
                    new TaskRelevance(true, 10, Array.Empty<string>(), Array.Empty<string>(), Array.Empty<string>()),
                    new CriterionScore(aiScore.TaskFulfilment, "Tốt", "", "", ""),
                    new CriterionScore(aiScore.Organization, "Tốt", "", "", ""),
                    new CriterionScore(aiScore.Vocabulary, "Tốt", "", "", ""),
                    new CriterionScore(aiScore.Grammar, "Tốt", "", "", ""),
                    Array.Empty<string>(), Array.Empty<string>(),
                    Array.Empty<Correction>(), "gemini-flash",
                    Array.Empty<InlineHighlight>(), Array.Empty<RecommendedStructure>(),
                    Array.Empty<RewriteSample>(), new GradingRoadmap("", "", 0, Array.Empty<WeeklyPlanTask>()),
                    Array.Empty<SentenceFeedback>(), null,
                    submission.Mode,
                    submission.EssayContent,
                    submission.WordCount);

                await _historyRepo.SaveAsync(domainResult);

                await _progressUseCase.UpdateAsync(submission.UserId);

                _logger.LogInformation(
                    "Submission {Id} graded. Overall: {Score}",
                    submission.SubmissionId, aiScore.Overall);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Grading failed for submission {Id}", submission.SubmissionId);

                // For now, we don't have UpdateStatusAsync in the new repo
                // await _historyRepo.UpdateStatusAsync(submission.SubmissionId, "failed");
            }
        }

        public async Task<List<SubmissionListItemResponse>> GetHistoryAsync(
            string userId,
            int limit = 20)
        {
            var results = await _historyRepo.GetHistoryAsync(userId, limit: limit);
            
            // Fetch all unique question IDs to minimize database calls
            var questionIds = results.Select(r => r.ExamId).Distinct().ToList();
            var questionMap = new Dictionary<string, string>();
            
            foreach (var qid in questionIds)
            {
                if (!string.IsNullOrEmpty(qid))
                {
                    var question = await _questionRepo.GetByIdAsync(qid);
                    if (question != null)
                    {
                        questionMap[qid] = question.Title;
                    }
                }
            }

            return results.Select(r => new SubmissionListItemResponse
            {
                Id            = r.Id,
                QuestionId    = r.ExamId,
                QuestionTitle = !string.IsNullOrEmpty(r.ExamId) && questionMap.TryGetValue(r.ExamId, out var title) 
                                ? title : "Writing Submission",
                TaskType      = r.TaskType,
                Mode          = r.Mode,
                WordCount     = r.WordCount,
                BelowMinWords = false,
                Status        = "scored",
                OverallScore  = r.TotalScore,
                CreatedAt     = r.GradedAt
            }).ToList();
        }

        public async Task<SubmissionResponse> GetByIdAsync(
            string userId,
            string submissionId)
        {
            if (string.IsNullOrWhiteSpace(submissionId))
                throw new ArgumentException("Submission ID cannot be null or empty", nameof(submissionId));

            _logger.LogInformation("Fetching result detail for {Id} (User: {Uid})", submissionId, userId);

            // 1. Check for obviously invalid IDs to prevent unintended polling (e.g. from /results/list)
            if (submissionId.Equals("list", StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogWarning("Invalid ID 'list' requested by user {Uid}", userId);
                return null; // Controller will return 404
            }
            
            // 2. Check if result already exists in history (graded results)
            var result = await _historyRepo.GetByIdAsync(submissionId);

            if (result != null)
            {
                if (result.StudentId != userId)
                {
                    _logger.LogWarning("Unauthorized access attempt to {Id} by {Uid}", submissionId, userId);
                    return null;
                }
                
                var question = await _questionRepo.GetByIdAsync(result.ExamId);
                
                // Match Exam System: TopicKeyword is the primary title
                var title = !string.IsNullOrEmpty(question?.TopicKeyword) ? question.TopicKeyword : 
                            (!string.IsNullOrEmpty(question?.Title) ? question.Title : 
                            (!string.IsNullOrEmpty(question?.Category) ? question.Category : 
                            result.ExamId));

                return MapDomainToResponse(result, title);
            }

            _logger.LogWarning("Result '{Id}' not found in 'grading_results'. AI might still be processing.", submissionId);
            
            return new SubmissionResponse
            {
                Id = submissionId,
                Status = "pending",
                CreatedAt = DateTime.UtcNow
            };
        }

        private SubmissionResponse MapDomainToResponse(VstepWritingLab.Domain.Entities.GradingResult r, string questionTitle = "") =>
            new SubmissionResponse
            {
                Id            = r.Id,
                QuestionId    = r.ExamId,
                QuestionTitle = questionTitle,
                TaskType      = r.TaskType,
                Mode          = r.Mode,
                Status        = "scored",
                EssayContent  = r.EssayText,
                WordCount     = r.WordCount,
                CreatedAt     = r.GradedAt,
                AiScore       = new AiScoreResponse
                {
                    TaskFulfilment = (int)r.TaskFulfilment.Score,
                    Organization   = (int)r.Organization.Score,
                    Vocabulary     = (int)r.Vocabulary.Score,
                    Grammar        = (int)r.Grammar.Score,
                    Overall        = r.TotalScore
                },
                AiFeedback = new AiFeedbackResponse
                {
                    Summary     = !string.IsNullOrEmpty(r.Summary) && r.Summary.Length > 20
                        ? r.Summary 
                        : $"Bài viết của bạn đạt mức điểm trung bình là {r.TotalScore}. Hãy xem chi tiết đánh giá về Bố cục, Từ vựng và Ngữ pháp bên dưới để cải thiện điểm số.",
                    Suggestions = r.ImprovementsVi?.ToList() ?? new List<string>(),
                    Highlights  = r.InlineHighlights?.Select(h => new HighlightResponse
                    {
                        Text  = h.Quote,
                        Issue = h.IssueVi ?? h.Issue,
                        Type  = h.Type,
                        Severity = h.Type == "strength" ? "good" : "error"
                    }).ToList() ?? new List<HighlightResponse>(),
                    SentenceFeedback = r.SentenceFeedback?.Select(s => new SentenceFeedbackResponse
                    {
                        Sentence = s.Sentence,
                        IsGood = s.IsGood,
                        Explanation = s.Explanation,
                        Suggestion = s.Suggestion
                    }).ToList() ?? new List<SentenceFeedbackResponse>(),
                    Roadmap = r.Roadmap == null ? null : new RoadmapResponse
                    {
                        CurrentLevel = r.Roadmap.CurrentLevel,
                        TargetLevel = r.Roadmap.TargetLevel,
                        EstimatedWeeks = r.Roadmap.EstimatedWeeks,
                        WeeklyPlan = r.Roadmap.WeeklyPlan?.Select(w => new WeeklyPlanResponse
                        {
                            Week = w.Week,
                            Focus = w.Focus,
                            Goal = w.Goal,
                            Tasks = w.Tasks?.ToList() ?? new List<string>()
                        }).ToList() ?? new List<WeeklyPlanResponse>()
                    }
                }
            };

        public async Task<SubmissionResponse> RetryAsync(
            string userId,
            string submissionId)
        {
            var result = await _historyRepo.GetByIdAsync(submissionId);
            if (result == null) throw new Exception("Submission not found");
            if (result.StudentId != userId) throw new Exception("Unauthorized");

            var question = await _questionRepo.GetByIdAsync(result.ExamId);
            if (question == null) throw new Exception("Question not found");

            var task = await _taskRepo.GetByIdAsync(question.TaskType);
            if (task == null) throw new Exception("Task not found");

            // Create a fake submission model to pass to AI service
            var submission = new SubmissionModel
            {
                SubmissionId = result.Id,
                UserId = result.StudentId,
                QuestionId = result.ExamId,
                TaskType = question.TaskType,
                Mode = result.Mode,
                EssayContent = result.EssayText, 
                WordCount = result.WordCount
            };

            // In a real retry, we should fetch the content from wherever it's stored.
            // For now, if content is missing, we might have to store it in GradingResult.
            // But let's assume the AI service can handle it or we fetch it from another source if needed.
            
            _ = GradeAndUpdateAsync(submission, question, task);

            return MapDomainToResponse(result);
        }

        private int CountWords(string text) =>
            text.Split(new[] { ' ', '\n', '\r', '\t' },
                StringSplitOptions.RemoveEmptyEntries).Length;

        private SubmissionResponse MapToResponse(SubmissionModel s) =>
            new SubmissionResponse
            {
                Id  = s.SubmissionId,
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
                        }).ToList() ?? new List<HighlightResponse>()
                },
                RetryCount = s.RetryCount,
                CreatedAt  = s.CreatedAt.ToDateTime(),
                ScoredAt   = s.ScoredAt?.ToDateTime()
            };
    }
}
