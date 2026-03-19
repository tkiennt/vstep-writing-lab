using System;
using System.Collections.Generic;

namespace VstepWritingLab.Shared.Models.DTOs.Responses
{
    public class ScoreHistoryItemResponse
    {
        public string SubmissionId { get; set; }
        public double Score { get; set; }
        public string TaskType { get; set; }
        public string Date { get; set; }
    }

    public class ProgressResponse
    {
        public int TotalEssays { get; set; }
        public int Task1Count { get; set; }
        public int Task2Count { get; set; }
        public double AverageScoreTask1 { get; set; }
        public double AverageScoreTask2 { get; set; }
        public double WeightedOverallScore { get; set; }
        public List<ScoreHistoryItemResponse> ScoreHistory { get; set; }
        public Dictionary<string, double> AverageBySkill { get; set; }
        public List<string> WeakSkills { get; set; }
        public int Streak { get; set; }
        public DateTime LastUpdatedAt { get; set; }
    }
}
