using Google.Cloud.Firestore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Threading;

namespace VstepWritingLab.Data.Repositories.Base
{
    public abstract class BaseRepository<T> where T : class
    {
        protected readonly FirestoreDb _db;
        protected readonly string _collectionName;

        protected BaseRepository(FirestoreDb db, string collectionName)
        {
            _db = db;
            _collectionName = collectionName;
        }

        protected CollectionReference Collection =>
            _db.Collection(_collectionName);

        public async Task<T?> GetByIdAsync(string id, CancellationToken ct = default)
        {
            var doc = await Collection.Document(id).GetSnapshotAsync(ct);
            return doc.Exists ? doc.ConvertTo<T>() : null;
        }

        public async Task<List<T>> GetAllAsync(CancellationToken ct = default)
        {
            var snapshot = await Collection.GetSnapshotAsync(ct);
            return snapshot.Documents
                .Where(d => d.Exists)
                .Select(d => d.ConvertTo<T>())
                .ToList();
        }

        public async Task<string> CreateAsync(T model, CancellationToken ct = default)
        {
            var docRef = await Collection.AddAsync(model, ct);
            return docRef.Id;
        }

        public async Task SetAsync(string id, T model, CancellationToken ct = default)
        {
            await Collection.Document(id).SetAsync(model, SetOptions.MergeAll, ct);
        }

        public async Task UpdateAsync(string id, Dictionary<string, object> fields, CancellationToken ct = default)
        {
            await Collection.Document(id).UpdateAsync(fields, cancellationToken: ct);
        }

        public async Task DeleteAsync(string id, CancellationToken ct = default)
        {
            await Collection.Document(id).DeleteAsync(cancellationToken: ct);
        }

        public async Task<bool> ExistsAsync(string id, CancellationToken ct = default)
        {
            var doc = await Collection.Document(id).GetSnapshotAsync(ct);
            return doc.Exists;
        }
    }
}
