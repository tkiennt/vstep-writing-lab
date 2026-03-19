using System.Collections.Generic;

namespace VSTEPWritingAI.Models.DTOs.Responses
{
    public class SentenceTemplateAdminResponse
    {
        public string TemplateId { get; set; }
        public string TaskType { get; set; }
        public string Category { get; set; }
        public string Part { get; set; }
        public List<string> Templates { get; set; }
        public bool IsActive { get; set; }
    }
}
