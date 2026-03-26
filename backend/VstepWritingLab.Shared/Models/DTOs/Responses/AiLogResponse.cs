using System;

namespace VstepWritingLab.Shared.Models.DTOs.Responses
{
    public class AiLogResponse
    {
        public string Id { get; set; }
        public DateTime Timestamp { get; set; }
        public string UserId { get; set; }
        public string UserName { get; set; }
        public string TopicTitle { get; set; }
        public string Status { get; set; }
        public string? ErrorMessage { get; set; }
    }
}
