using System;

namespace VstepWritingLab.Shared.Models.DTOs.Requests
{
    public class AdminAiLogsRequest
    {
        public DateTime? From { get; set; }
        public DateTime? To { get; set; }
        // Default: last 30 days if not provided
    }
}
