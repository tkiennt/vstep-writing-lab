
using System.ComponentModel.DataAnnotations;

namespace VstepWritingLab.Shared.Models.DTOs.Requests
{
    public class UpdateProfileRequest
    {
        [StringLength(50)]
        public string? FirstName { get; set; }

        [StringLength(50)]
        public string? LastName { get; set; }

        public string? DisplayName { get; set; }

        public string? AvatarUrl { get; set; }

        public string? TargetLevel { get; set; } // "B1", "B2", "C1"

        public bool? EmailNotificationsEnabled { get; set; }
        public bool? WebNotificationsEnabled { get; set; }
    }
}
