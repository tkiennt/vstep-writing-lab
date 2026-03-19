using System;

namespace VstepWritingLab.Shared.Models.DTOs.Responses
{
    public class SubmissionListItemResponse
    {
        public string SubmissionId { get; set; }
        public string QuestionId { get; set; }
        public string QuestionTitle { get; set; }  // denormalized for UI
        public string TaskType { get; set; }
        public string Mode { get; set; }
        public int WordCount { get; set; }
        public bool BelowMinWords { get; set; }
        public string Status { get; set; }
        public double? OverallScore { get; set; }  // null if not yet scored
        public DateTime CreatedAt { get; set; }
    }
}
