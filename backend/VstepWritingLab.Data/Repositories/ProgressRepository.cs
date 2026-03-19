using VstepWritingLab.Business.Interfaces;
using Google.Cloud.Firestore;
using VstepWritingLab.Shared.Models.Entities;
using VstepWritingLab.Data.Repositories.Base;

namespace VstepWritingLab.Data.Repositories;

public class ProgressRepository(FirestoreDb db) : BaseRepository<ProgressModel>(db, "progress"), ILegacyProgressRepository
{
}
