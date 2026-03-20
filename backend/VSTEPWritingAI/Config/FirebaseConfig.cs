using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Google.Cloud.Firestore;

namespace VSTEPWritingAI.Config
{
    public static class FirebaseConfig
    {
        public static void Initialize(IConfiguration config)
        {
            var credentialPath = config["Firebase:CredentialPath"];

            // Initialize Firebase Admin SDK (used for Auth token verification)
            if (FirebaseApp.DefaultInstance == null)
            {
                FirebaseApp.Create(new AppOptions
                {
                    Credential = GoogleCredential.FromFile(credentialPath)
                });
            }
        }

        public static FirestoreDb GetFirestoreDb(IConfiguration config)
        {
            var projectId = config["Firebase:ProjectId"];
            var credentialPath = config["Firebase:CredentialPath"];

            Environment.SetEnvironmentVariable(
                "GOOGLE_APPLICATION_CREDENTIALS", credentialPath);

            return FirestoreDb.Create(projectId);
        }
    }
}
