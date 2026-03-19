using System;
using System.Collections.Generic;

namespace VstepWritingLab.Shared.Models.DTOs.Responses
{
    public class AiScoreResponse
    {
        public int TaskFulfilment { get; set; }
        public int Organization { get; set; }
        public int Vocabulary { get; set; }
        public int Grammar { get; set; }
        public double Overall { get; set; }
    }

    public class HighlightResponse
    {
        public string Text { get; set; }
        public string Issue { get; set; }
        public string Type { get; set; }
    }

    public class AiFeedbackResponse
    {
        public string Summary { get; set; }
        public List<string> Suggestions { get; set; }
        public List<HighlightResponse> Highlights { get; set; }
    }

    public class SubmissionResponse
    {
        public string SubmissionId { get; set; }
        public string QuestionId { get; set; }
        public string TaskType { get; set; }
        public string Mode { get; set; }
        public string EssayContent { get; set; }
        public int WordCount { get; set; }
        public bool BelowMinWords { get; set; }
        public string Status { get; set; }
        public AiScoreResponse? AiScore { get; set; }
        public AiFeedbackResponse? AiFeedback { get; set; }
        public int RetryCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ScoredAt { get; set; }
    }
}
