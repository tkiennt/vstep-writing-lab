namespace VstepWritingLab.Domain.Entities;

public class User
{
    public string   Uid           { get; private set; } = string.Empty;
    public string   DisplayName   { get; private set; } = string.Empty;
    public string   Email         { get; private set; } = string.Empty;
    public string   Role          { get; private set; } = "student"; // "student"|"admin"
    public DateTime CreatedAt     { get; private set; }
    public DateTime LastActiveAt  { get; private set; }
    public bool     IsActive      { get; private set; }

    private User() { }

    public static User Create(string uid, string displayName, string email, string role = "student")
    {
        return new User {
            Uid = uid,
            DisplayName = displayName,
            Email = email,
            Role = role,
            CreatedAt = DateTime.UtcNow,
            LastActiveAt = DateTime.UtcNow,
            IsActive = true
        };
    }
}
