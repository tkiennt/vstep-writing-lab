using System.Collections.Generic;

namespace VSTEPWritingAI.Models.DTOs.Responses
{
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
