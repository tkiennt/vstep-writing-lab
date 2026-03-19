using System.Collections.Generic;

namespace VSTEPWritingAI.Models.DTOs.Requests
{
    public class CreateQuestionRequest
    {
        public string TaskType { get; set; }
        // "task1" | "task2"

        public string Category { get; set; }
        // e.g. "informal_invitation", "opinion_essay"

        public string Title { get; set; }
        public string Instructions { get; set; }
        public List<string> Requirements { get; set; }

        public string Level { get; set; }
        // "B1" | "B2" | "C1"
    }
}
