using System.Collections.Generic;

namespace VSTEPWritingAI.Models.DTOs.Requests
{
    public class CreateSentenceTemplateRequest
    {
        public string TaskType { get; set; }
        public string Category { get; set; }
        public string Part { get; set; }
        public List<string> Templates { get; set; }
    }
}
