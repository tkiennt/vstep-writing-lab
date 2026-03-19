using Google.Cloud.Firestore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VstepWritingLab.Shared.Models.Common;
using VstepWritingLab.Shared.Models.DTOs.Responses;
using VstepWritingLab.Shared.Models.Entities;
using VstepWritingLab.Business.Interfaces;

namespace VstepWritingLab.Business.Services
{
    public class ProgressService
    {
        private readonly ILegacyProgressRepository _progressRepo;

        public ProgressService(ILegacyProgressRepository progressRepo)
        {
            _progressRepo = progressRepo;
        }

        public async Task<ProgressResponse> GetByUserIdAsync(string userId)
        {
            var progress = await _progressRepo.GetByIdAsync(userId);
            if (progress == null)
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

            return new ProgressResponse
            {
                TotalEssays          = progress.TotalEssays,
                Task1Count           = progress.Task1Count,
                Task2Count           = progress.Task2Count,
                AverageScoreTask1    = progress.AverageScoreTask1,
                AverageScoreTask2    = progress.AverageScoreTask2,
                WeightedOverallScore = progress.WeightedOverallScore,
                ScoreHistory         = progress.ScoreHistory.Select(s => new ScoreHistoryItemResponse
                {
                    SubmissionId = s.SubmissionId,
                    Score        = s.Score,
                    TaskType     = s.TaskType,
                    Date         = s.Date
                }).ToList(),
                AverageBySkill       = progress.AverageBySkill,
                WeakSkills           = progress.WeakSkills,
                Streak               = progress.Streak,
                LastUpdatedAt        = progress.LastUpdatedAt.ToDateTime()
            };
        }

        public async Task UpdateAfterSubmissionAsync(
            string userId,
            string taskType,
            AiScoreModel score)
        {
            var progress = await _progressRepo.GetByIdAsync(userId);
            
            if (progress == null)
            {
                progress = new ProgressModel
                {
                    UserId               = userId,
                    TotalEssays          = 0,
                    Task1Count           = 0,
                    Task2Count           = 0,
                    AverageScoreTask1    = 0,
                    AverageScoreTask2    = 0,
                    WeightedOverallScore = 0,
                    ScoreHistory         = new List<ScoreHistoryItem>(),
                    AverageBySkill       = new Dictionary<string, double>
                    {
                        { "taskFulfilment", 0 },
                        { "organization", 0 },
                        { "vocabulary", 0 },
                        { "grammar", 0 }
                    },
                    WeakSkills           = new List<string>(),
                    Streak               = 1,
                    LastUpdatedAt        = Timestamp.GetCurrentTimestamp()
                };
            }

            progress.TotalEssays += 1;
            if (taskType == "task1") progress.Task1Count += 1;
            else progress.Task2Count += 1;

            progress.ScoreHistory.Insert(0, new ScoreHistoryItem
            {
                SubmissionId = Guid.NewGuid().ToString(),
                Score        = score.Overall,
                TaskType     = taskType,
                Date         = DateTime.UtcNow.ToString("yyyy-MM-dd")
            });
            if (progress.ScoreHistory.Count > 50) progress.ScoreHistory.RemoveAt(50);

            progress.AverageScoreTask1 = RecalculateAverage(progress.AverageScoreTask1, progress.Task1Count, score.Overall, taskType == "task1");
            progress.AverageScoreTask2 = RecalculateAverage(progress.AverageScoreTask2, progress.Task2Count, score.Overall, taskType == "task2");
            
            progress.WeightedOverallScore = Math.Round((progress.AverageScoreTask1 * 0.33) + (progress.AverageScoreTask2 * 0.67), 1);

            UpdateSkillAverage(progress.AverageBySkill, "taskFulfilment", progress.TotalEssays, score.TaskFulfilment);
            UpdateSkillAverage(progress.AverageBySkill, "organization", progress.TotalEssays, score.Organization);
            UpdateSkillAverage(progress.AverageBySkill, "vocabulary", progress.TotalEssays, score.Vocabulary);
            UpdateSkillAverage(progress.AverageBySkill, "grammar", progress.TotalEssays, score.Grammar);

            progress.WeakSkills = progress.AverageBySkill
                .Where(kv => kv.Value < 5.0)
                .Select(kv => kv.Key)
                .ToList();

            progress.LastUpdatedAt = Timestamp.GetCurrentTimestamp();

            await _progressRepo.SetAsync(userId, progress);
        }

        private double RecalculateAverage(double currentAvg, int count, double newScore, bool isMatch)
        {
            if (!isMatch) return currentAvg;
            if (count == 1) return newScore;
            return Math.Round(((currentAvg * (count - 1)) + newScore) / count, 1);
        }

        private void UpdateSkillAverage(Dictionary<string, double> dict, string skill, int total, int newScore)
        {
            var current = dict.GetValueOrDefault(skill, 0);
            dict[skill] = Math.Round(((current * (total - 1)) + newScore) / total, 1);
        }
    }
}
