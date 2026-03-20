using System;
using System.Collections.Generic;

namespace VSTEPWritingAI.Models.DTOs.Responses
{
    public class ImportResultResponse
    {
        public bool Success { get; set; }
        public int TotalProcessed { get; set; }
        public int TotalImported { get; set; }
        public int TotalSkipped { get; set; }
        public List<string> Errors { get; set; } = new();
        public string Message { get; set; }
        public DateTime ImportedAt { get; set; } = DateTime.UtcNow;
    }
}
