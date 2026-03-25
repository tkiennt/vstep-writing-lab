
using System;

namespace VstepWritingLab.Shared.Models.DTOs.Responses
{
    public class UserProfileResponse
    {
        public string UserId { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public string Role { get; set; } = string.Empty;
        public string? CurrentLevel { get; set; }
        public string? TargetLevel { get; set; }
        public bool EmailNotificationsEnabled { get; set; }
        public bool WebNotificationsEnabled { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime LastActiveAt { get; set; }
    }
}
