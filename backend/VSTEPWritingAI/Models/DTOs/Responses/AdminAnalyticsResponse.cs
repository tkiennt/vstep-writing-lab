using System;

namespace VSTEPWritingAI.Models.DTOs.Responses
{
    public class AdminAnalyticsResponse
    {
        public int TotalUsers { get; set; }
        public int TotalStudents { get; set; }
        public int TotalSubmissions { get; set; }
        public int ScoredSubmissions { get; set; }
        public int FailedSubmissions { get; set; }
        public double AverageOverallScore { get; set; }
        public int TotalTokensUsed { get; set; }
        public int TotalTask1Submissions { get; set; }
        public int TotalTask2Submissions { get; set; }
        public DateTime GeneratedAt { get; set; }
    }
}
