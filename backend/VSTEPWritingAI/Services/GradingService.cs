using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VSTEPWritingAI.Models.Firestore;
using VSTEPWritingAI.Models.DTOs;
using VSTEPWritingAI.Models.DTOs.Responses;
using VSTEPWritingAI.Models.Common;
using VSTEPWritingAI.Repositories;
using VSTEPWritingAI.Repositories;

namespace VSTEPWritingAI.Services
{
    public class GradingService
    {
        private readonly GradingRepository _repository;
        private readonly AiGradingService _aiGradingService;
        private readonly QuestionRepository _questionRepo;
        private readonly TaskRepository _taskRepo;

        public GradingService(
            GradingRepository repository,
            AiGradingService aiGradingService,
            QuestionRepository questionRepo,
            TaskRepository taskRepo)
        {
            _repository = repository;
            _aiGradingService = aiGradingService;
            _questionRepo = questionRepo;
            _taskRepo = taskRepo;
        }

        public async Task<Essay> GradeEssayAsync(Essay essay)
        {
            // 1. Validate Question & Task
            var questionId = string.IsNullOrEmpty(essay.ExamId) ? essay.TaskType : essay.ExamId;
            var question = await _questionRepo.GetByIdAsync(questionId);
            if (question == null) throw new Exception($"Question/Exam {questionId} not found");

            var task = await _taskRepo.GetByIdAsync(question.TaskType);
            if (task == null) throw new Exception($"Task {question.TaskType} not found");

            // 2. Prepare submission for AI Grading
            var submission = new SubmissionModel
            {
                SubmissionId = essay.EssayId ?? Guid.NewGuid().ToString("N"),
                TaskType = question.TaskType,
                EssayContent = essay.EssayContent,
                WordCount = essay.EssayContent.Split(new[] { ' ', '\n', '\r', '\t' }, StringSplitOptions.RemoveEmptyEntries).Length,
                UserId = essay.StudentId,
                Mode = "practice",
                QuestionId = questionId
            };

            // 3. Grade using Gemini
            var aiResult = await _aiGradingService.GradeAsync(submission, question, task);

            // 4. Map results to Essay model
            essay.EssayId = submission.SubmissionId;
            essay.TaskType = question.TaskType;
            essay.TopicCategory = question.Category;
            essay.TopicKeyword = question.Title;
            essay.TotalScore = aiResult.Score.Overall;
            
            essay.Scores = new Scores
            {
                TaskFulfilment = aiResult.Score.TaskFulfilment,
                Organization = aiResult.Score.Organization,
                Vocabulary = aiResult.Score.Vocabulary,
                Grammar = aiResult.Score.Grammar
            };

            essay.CefrLevel = MapScoreToCefr(aiResult.Score.Overall);
            
            essay.Feedback = new Feedback
            {
                TaskFulfilment = new FeedbackItem { FeedbackEn = aiResult.Feedback.Summary },
                Organization = new FeedbackItem { FeedbackEn = "" },
                Vocabulary = new FeedbackItem { FeedbackEn = "" },
                Grammar = new FeedbackItem { FeedbackEn = "" }
            };

            // Combine suggestions/highlights into Corrections
            essay.Corrections = aiResult.Feedback.Suggestions.ToList();
            if (aiResult.Feedback.Highlights != null)
            {
                essay.Corrections.AddRange(aiResult.Feedback.Highlights.Select(h => $"[{h.Type}] {h.Text}: {h.Issue}"));
            }

            essay.SubmittedAt = DateTime.UtcNow;
            essay.Status = "annotated";
            essay.BandComparison = $"Near Band {Math.Ceiling(essay.TotalScore)}";

            // 5. Save to Firestore
            await _repository.SaveEssayAsync(essay);
            return essay;
        }

        public async Task<object> GetProgressAsync(string studentId)
        {
            var essays = await _repository.GetEssaysByStudentAsync(studentId);
            if (essays == null || essays.Count == 0) return null;

            var avgScores = new Scores
            {
                TaskFulfilment = Math.Round(essays.Average(e => e.Scores.TaskFulfilment), 1),
                Organization = Math.Round(essays.Average(e => e.Scores.Organization), 1),
                Vocabulary = Math.Round(essays.Average(e => e.Scores.Vocabulary), 1),
                Grammar = Math.Round(essays.Average(e => e.Scores.Grammar), 1)
            };

            string weakestCriterion = "TaskFulfilment";
            double minAvg = new[] { avgScores.TaskFulfilment, avgScores.Organization, avgScores.Vocabulary, avgScores.Grammar }.Min();
            if (minAvg == avgScores.Organization) weakestCriterion = "Organization";
            else if (minAvg == avgScores.Vocabulary) weakestCriterion = "Vocabulary";
            else if (minAvg == avgScores.Grammar) weakestCriterion = "Grammar";

            // Compute trend
            string trend = "stable";
            var sortedEssays = essays.OrderBy(e => e.SubmittedAt).ToList();
            if (sortedEssays.Count >= 2)
            {
                var firstHalf = sortedEssays.Take(sortedEssays.Count / 2).Average(e => e.TotalScore);
                var secondHalf = sortedEssays.Skip(sortedEssays.Count / 2).Average(e => e.TotalScore);
                trend = secondHalf > firstHalf ? "improving" : (secondHalf < firstHalf ? "declining" : "stable");
            }

            var recentScore = sortedEssays.Last().TotalScore;

            return new
            {
                studentId,
                avgScores,
                overallCefr = MapScoreToCefr(recentScore),
                weakestCriterion,
                trend,
                bandComparison = $"Near Band {Math.Ceiling(recentScore)}"
            };
        }

        public async Task<List<Essay>> GetHistoryAsync(string studentId)
        {
            var essays = await _repository.GetEssaysByStudentAsync(studentId);
            return essays.OrderByDescending(e => e.SubmittedAt).ToList();
        }

        public async Task<object> GetReportAsync(string studentId)
        {
            var essays = await GetHistoryAsync(studentId);
            var progress = await GetProgressAsync(studentId);

            return new
            {
                studentId,
                reportGeneratedAt = DateTime.UtcNow,
                summary = progress,
                recommendations = new List<string>
                {
                    "Focus on grammar exercises based on your weakest past patterns.",
                    "Use more sophisticated vocabulary for academic topics.",
                    "Review recent corrections to avoid repeating spelling errors."
                },
                history = essays
            };
        }

        private string MapScoreToCefr(double score) => score switch
        {
            >= 8.5 => "C1",
            >= 6.5 => "B2",
            >= 4.0 => "B1",
            _      => "A2"
        };

        // ── Compatibility Methods (for Existing Services) ────────────────────────
        public async Task UpdateAfterSubmissionAsync(string userId, string taskType, AiScoreModel score)
        {
            var essay = new Essay
            {
                EssayId = "legacy_" + Guid.NewGuid().ToString("N"),
                StudentId = userId,
                TaskType = taskType,
                TotalScore = score.Overall,
                CefrLevel = MapScoreToCefr(score.Overall),
                Scores = new Scores
                {
                    TaskFulfilment = score.TaskFulfilment,
                    Organization = score.Organization,
                    Vocabulary = score.Vocabulary,
                    Grammar = score.Grammar
                },
                SubmittedAt = DateTime.UtcNow,
                Status = "annotated"
            };
            await _repository.SaveEssayAsync(essay);
        }

        public async Task<ProgressResponse> GetByUserIdAsync(string userId)
        {
            var history = await _repository.GetEssaysByStudentAsync(userId);
            if (!history.Any())
            {
                return new ProgressResponse
                {
                    TotalEssays = 0,
                    ScoreHistory = new List<ScoreHistoryItemResponse>(),
                    AverageBySkill = new Dictionary<string, double>(),
                    WeakSkills = new List<string>(),
                    LastUpdatedAt = DateTime.UtcNow
                };
            }

            var avgTaskF = history.Average(e => e.Scores.TaskFulfilment);
            var avgOrg = history.Average(e => e.Scores.Organization);
            var avgVoc = history.Average(e => e.Scores.Vocabulary);
            var avgGram = history.Average(e => e.Scores.Grammar);

            var criteria = new Dictionary<string, double>
            {
                { "taskFulfilment", avgTaskF },
                { "organization", avgOrg },
                { "vocabulary", avgVoc },
                { "grammar", avgGram }
            };
            var weakest = criteria.MinBy(x => x.Value).Key;

            var recentScore = history.OrderBy(e => e.SubmittedAt).Last().TotalScore;

            return new ProgressResponse
            {
                TotalEssays = history.Count,
                WeightedOverallScore = recentScore,
                ScoreHistory = history.Select(h => new ScoreHistoryItemResponse
                {
                    SubmissionId = h.EssayId,
                    Score = h.TotalScore,
                    TaskType = h.TaskType,
                    Date = $"{h.SubmittedAt.Year}-W{System.Globalization.ISOWeek.GetWeekOfYear(h.SubmittedAt):D2}"
                }).ToList(),
                AverageBySkill = criteria,
                WeakSkills = new List<string> { weakest },
                Streak = 1,
                LastUpdatedAt = DateTime.UtcNow
            };
        }
    }
}
