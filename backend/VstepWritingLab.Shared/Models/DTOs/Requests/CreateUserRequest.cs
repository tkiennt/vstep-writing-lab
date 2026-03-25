using System.ComponentModel.DataAnnotations;

namespace VstepWritingLab.Shared.Models.DTOs.Requests
{
    public class CreateUserRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [MinLength(6)]
        public string Password { get; set; }

        [Required]
        public string DisplayName { get; set; }

        [Required]
        public string Role { get; set; } // "student", "teacher", "admin"
    }
}
