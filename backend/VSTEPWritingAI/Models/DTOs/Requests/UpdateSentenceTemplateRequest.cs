using System.Collections.Generic;

namespace VSTEPWritingAI.Models.DTOs.Requests
{
    public class UpdateSentenceTemplateRequest
    {
        public List<string>? Templates { get; set; }
        public bool? IsActive { get; set; }
    }
}
