namespace VstepWritingLab.Shared.Models.DTOs.Requests
{
    public class RegisterRequest
    {
        public string FirebaseToken { get; set; }
        // Firebase ID token obtained from frontend after signup

        public string DisplayName { get; set; }
        // Full name entered by user during registration
    }
}
