using System.Collections.Generic;

namespace VSTEPWritingAI.Models.DTOs.Requests
{
    public class UpdateQuestionRequest
    {
        public string? Title { get; set; }
        public string? Instructions { get; set; }
        public List<string>? Requirements { get; set; }
        public string? Level { get; set; }
        public bool? IsActive { get; set; }
    }
}
