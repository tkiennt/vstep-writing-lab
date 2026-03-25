using System;

namespace VstepWritingLab.Shared.Models.DTOs.Responses
{
    public class AdminUserResponse
    {
        public string UserId { get; set; }
        public string Email { get; set; }
        public string DisplayName { get; set; }
        public string Role { get; set; }
        public bool IsActive { get; set; }
        public long SubmissionCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime LastLoginAt { get; set; }
    }
}
