using System;

namespace VSTEPWritingAI.Models.DTOs.Requests
{
    public class AdminAiLogsRequest
    {
        public DateTime? From { get; set; }
        public DateTime? To { get; set; }
        // Default: last 30 days if not provided
    }
}
