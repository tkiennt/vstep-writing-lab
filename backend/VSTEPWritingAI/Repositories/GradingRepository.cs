using Google.Cloud.Firestore;
using System.Collections.Generic;
using System.Threading.Tasks;
using VSTEPWritingAI.Models.Firestore;

namespace VSTEPWritingAI.Repositories
{
    public class GradingRepository
    {
        private readonly FirestoreDb _firestore;

        public GradingRepository(FirestoreDb firestore)
        {
            _firestore = firestore;
        }

        public async Task SaveEssayAsync(Essay essay)
        {
            if (string.IsNullOrEmpty(essay.EssayId))
            {
                essay.EssayId = System.Guid.NewGuid().ToString("N");
            }
            CollectionReference essays = _firestore.Collection("grading_history");
            await essays.Document(essay.EssayId).SetAsync(essay);
        }

        public async Task<List<Essay>> GetEssaysByStudentAsync(string studentId)
        {
            CollectionReference essays = _firestore.Collection("grading_history");
            Query query = essays.WhereEqualTo("StudentId", studentId);
            QuerySnapshot snapshot = await query.GetSnapshotAsync();

            List<Essay> result = new List<Essay>();
            foreach (DocumentSnapshot doc in snapshot.Documents)
            {
                if (doc.Exists)
                {
                    result.Add(doc.ConvertTo<Essay>());
                }
            }
            return result;
        }
    }
}
