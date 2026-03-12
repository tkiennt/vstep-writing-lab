namespace VstepWritingLab.Shared.Models;

public class TopicDto
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // e.g., Task 1, Task 2
}

public class EssayDto
{
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string TopicId { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Feedback { get; set; } = string.Empty;
    public float Score { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class RegisterRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
}
