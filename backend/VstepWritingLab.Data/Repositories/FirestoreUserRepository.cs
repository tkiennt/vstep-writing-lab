using Google.Cloud.Firestore;
using VstepWritingLab.Domain.Entities;
using VstepWritingLab.Domain.Interfaces;

namespace VstepWritingLab.Data.Repositories;

public class FirestoreUserRepository(FirestoreDb db) : IUserRepository
{
    private readonly CollectionReference _collection = db.Collection("users");

    public async Task<User?> GetByIdAsync(string uid, CancellationToken ct = default)
    {
        var doc = await _collection.Document(uid).GetSnapshotAsync(ct);
        return doc.Exists ? doc.ConvertTo<User>() : null;
    }

    public async Task UpsertAsync(User user, CancellationToken ct = default)
    {
        await _collection.Document(user.Uid).SetAsync(user, SetOptions.MergeAll, ct);
    }
}
