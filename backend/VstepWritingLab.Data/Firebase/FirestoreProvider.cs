using Google.Cloud.Firestore;
using Microsoft.Extensions.Configuration;

namespace VstepWritingLab.Data.Firebase;

public class FirestoreProvider
{
    private readonly FirestoreDb _firestoreDb;

    public FirestoreProvider(IConfiguration configuration)
    {
        string projectId = configuration["Firebase:ProjectId"] ?? throw new ArgumentNullException("Firebase ProjectId is missing");
        // In production, the GOOGLE_APPLICATION_CREDENTIALS environment variable should be set.
        _firestoreDb = FirestoreDb.Create(projectId);
    }

    public FirestoreDb GetDb() => _firestoreDb;
}
