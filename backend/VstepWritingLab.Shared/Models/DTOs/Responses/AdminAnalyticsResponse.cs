using System;

namespace VstepWritingLab.Shared.Models.DTOs.Responses
{
    public class HourlyStatDto
    {
        public string Hour { get; set; }
        public int Submissions { get; set; }
        public int Graded { get; set; }
    }

    public class AdminAnalyticsResponse
    {
        public int TotalUsers { get; set; }
        public int TotalEssays { get; set; }
        public int TotalGradedSuccessfully { get; set; }
        public int TotalFailed { get; set; }
        public int PendingQueue { get; set; }
        public string AvgResponseTime { get; set; } = "0s";
        public int TokenUsagePercent { get; set; }
        public List<HourlyStatDto> HourlyStats { get; set; } = new();
    }
}
