using System.Collections.Generic;

namespace VstepWritingLab.Shared.Models.DTOs.Responses
{
    public class QuestionResponse
    {
        public string QuestionId { get; set; }
        public string TaskType { get; set; }
        public string Category { get; set; }
        public string Title { get; set; }
        public string Instructions { get; set; }
        public List<string> Requirements { get; set; }
        public string Level { get; set; }
    }

    public class SentenceTemplateResponse
    {
        public string Part { get; set; }
        // "introduction" | "body" | "closing" | "conclusion"

        public List<string> Templates { get; set; }
    }

    public class QuestionDetailResponse : QuestionResponse
    {
        public TaskResponse? Task { get; set; }
        // Full task info (duration, minWords, etc.)

        public List<SentenceTemplateResponse> SentenceTemplates { get; set; }
        // Only populated when mode = "guided"
        // Empty list when mode = "practice"
    }
}
