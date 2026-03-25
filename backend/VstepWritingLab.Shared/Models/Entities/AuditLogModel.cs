using Google.Cloud.Firestore;
using System;

namespace VstepWritingLab.Shared.Models.Entities
{
    [FirestoreData]
    public class AuditLogModel
    {
        [FirestoreDocumentId]
        public string Id { get; set; }

        [FirestoreProperty] public string UserId { get; set; }
        [FirestoreProperty] public string AdminEmail { get; set; } // Keep for display

        [FirestoreProperty] public string Action { get; set; } 
        // "USER_CREATED", "USER_DELETED", "STATUS_CHANGED", "ROLE_CHANGED", "SCORE_OVERRIDDEN", "ESSAY_DELETED"

        [FirestoreProperty] public string EntityType { get; set; }
        [FirestoreProperty] public string EntityId { get; set; }
        
        [FirestoreProperty] public Timestamp Timestamp { get; set; }
        [FirestoreProperty] public string Status { get; set; } // "Success", "Failure"
        
        [FirestoreProperty] public string IpAddress { get; set; }
        [FirestoreProperty] public string UserAgent { get; set; }
        
        [FirestoreProperty] public string BeforeData { get; set; } // JSON string
        [FirestoreProperty] public string AfterData { get; set; } // JSON string
        [FirestoreProperty] public string ErrorMessage { get; set; }
    }
}
