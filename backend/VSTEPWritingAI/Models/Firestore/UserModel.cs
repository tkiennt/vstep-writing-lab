using Google.Cloud.Firestore;

namespace VSTEPWritingAI.Models.Firestore
{
    [FirestoreData]
    public class UserModel
    {
        [FirestoreDocumentId]
        public string UserId { get; set; }
        // = Firebase Auth UID, set automatically

        [FirestoreProperty] public string Email { get; set; }
        [FirestoreProperty] public string DisplayName { get; set; }

        [FirestoreProperty] public string Role { get; set; }
        // "student" | "admin"

        [FirestoreProperty] public bool IsActive { get; set; }
        // false = banned/deactivated by admin

        [FirestoreProperty] public Timestamp CreatedAt { get; set; }
        [FirestoreProperty] public Timestamp LastLoginAt { get; set; }
    }
}
