using Google.Cloud.Firestore;
using VSTEPWritingAI.Models.Firestore;
using VSTEPWritingAI.Repositories.Base;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace VSTEPWritingAI.Repositories
{
    public class UserRepository : BaseRepository<UserModel>
    {
        public UserRepository(FirestoreDb db)
            : base(db, "users") { }

        public async Task<UserModel?> GetByEmailAsync(string email)
        {
            var query = Collection.WhereEqualTo("Email", email).Limit(1);
            var snapshot = await query.GetSnapshotAsync();
            var doc = snapshot.Documents.FirstOrDefault();
            return doc?.ConvertTo<UserModel>();
        }

        public async Task<List<UserModel>> GetByRoleAsync(string role)
        {
            var query = Collection.WhereEqualTo("Role", role);
            var snapshot = await query.GetSnapshotAsync();
            return snapshot.Documents
                .Select(d => d.ConvertTo<UserModel>())
                .ToList();
        }
    }
}
