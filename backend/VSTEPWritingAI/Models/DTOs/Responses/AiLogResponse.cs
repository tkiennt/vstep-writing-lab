using System;

namespace VSTEPWritingAI.Models.DTOs.Responses
{
    public class AiLogResponse
    {
        public string LogId { get; set; }
        public string SubmissionId { get; set; }
        public string UserId { get; set; }
        public string Model { get; set; }
        public int PromptTokens { get; set; }
        public int CompletionTokens { get; set; }
        public int TotalTokens { get; set; }
        public int LatencyMs { get; set; }
        public string Status { get; set; }
        public string? ErrorMessage { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
