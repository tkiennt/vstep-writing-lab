using Google.Cloud.Firestore;

namespace VstepWritingLab.Shared.Models.Entities
{
    [FirestoreData]
    public class UserModel
    {
        [FirestoreDocumentId]
        public string UserId { get; set; }
        // = Firebase Auth UID, set automatically

        [FirestoreProperty] public string Email { get; set; }
        [FirestoreProperty] public string DisplayName { get; set; }
        [FirestoreProperty] public string? AvatarUrl { get; set; }

        [FirestoreProperty] public string Role { get; set; }
        // "student" | "admin"

        [FirestoreProperty] public bool IsActive { get; set; }
        // false = banned/deactivated by admin

        [FirestoreProperty] public bool OnboardingCompleted { get; set; }
        [FirestoreProperty] public string? CurrentLevel { get; set; }
        [FirestoreProperty] public string? TargetLevel { get; set; }
        [FirestoreProperty] public bool EmailNotificationsEnabled { get; set; } = true;
        [FirestoreProperty] public bool WebNotificationsEnabled { get; set; } = true;

        [FirestoreProperty] public Timestamp CreatedAt { get; set; }
        [FirestoreProperty] public Timestamp LastActiveAt { get; set; } 
    }
}
