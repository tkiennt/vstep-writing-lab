using System.Collections.Generic;

namespace VSTEPWritingAI.Models.DTOs.Responses
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
}
