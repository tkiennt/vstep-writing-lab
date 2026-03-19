using Google.Cloud.Firestore;
using VstepWritingLab.Domain.Entities;

namespace VstepWritingLab.Data.PersistenceModels;

[FirestoreData]
public class UserDocument
{
    [FirestoreDocumentId] public string Uid { get; set; } = string.Empty;
    [FirestoreProperty] public string DisplayName { get; set; } = string.Empty;
    [FirestoreProperty] public string Email { get; set; } = string.Empty;
    [FirestoreProperty] public string Role { get; set; } = string.Empty;
    [FirestoreProperty] public Timestamp CreatedAt { get; set; }
    [FirestoreProperty] public Timestamp LastActiveAt { get; set; }
    [FirestoreProperty] public bool IsActive { get; set; }

    public static UserDocument FromDomain(User domain) => new()
    {
        Uid = domain.Uid,
        DisplayName = domain.DisplayName,
        Email = domain.Email,
        Role = domain.Role,
        CreatedAt = Timestamp.FromDateTime(domain.CreatedAt.ToUniversalTime()),
        LastActiveAt = Timestamp.FromDateTime(domain.LastActiveAt.ToUniversalTime()),
        IsActive = domain.IsActive
    };

    public User ToDomain() => User.Create(Uid, DisplayName, Email, Role);
}
