namespace VstepWritingLab.Shared.Models.DTOs.Requests
{
    public class UpdateUserRequest
    {
        public string? Role { get; set; }
        // "student" | "admin" — null = no change

        public bool? IsActive { get; set; }
        // null = no change
    }
}
