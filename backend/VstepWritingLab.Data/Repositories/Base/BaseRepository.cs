using Google.Cloud.Firestore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

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

        public async Task<T?> GetByIdAsync(string id)
        {
            var doc = await Collection.Document(id).GetSnapshotAsync();
            return doc.Exists ? doc.ConvertTo<T>() : null;
        }

        public async Task<List<T>> GetAllAsync()
        {
            var snapshot = await Collection.GetSnapshotAsync();
            return snapshot.Documents
                .Where(d => d.Exists)
                .Select(d => d.ConvertTo<T>())
                .ToList();
        }

        public async Task<string> CreateAsync(T model)
        {
            var docRef = await Collection.AddAsync(model);
            return docRef.Id;
        }

        public async Task SetAsync(string id, T model)
        {
            await Collection.Document(id).SetAsync(model, SetOptions.MergeAll);
        }

        public async Task UpdateAsync(string id, Dictionary<string, object> fields)
        {
            await Collection.Document(id).UpdateAsync(fields);
        }

        public async Task DeleteAsync(string id)
        {
            await Collection.Document(id).DeleteAsync();
        }

        public async Task<bool> ExistsAsync(string id)
        {
            var doc = await Collection.Document(id).GetSnapshotAsync();
            return doc.Exists;
        }
    }
}
