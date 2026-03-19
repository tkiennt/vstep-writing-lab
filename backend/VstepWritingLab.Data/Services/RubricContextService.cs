using VstepWritingLab.Domain.Interfaces;
using Google.Cloud.Firestore;

namespace VstepWritingLab.Data.Services;

public class RubricContextService(FirestoreDb db) : IRubricContextService
{
    public async Task<string> GetContextAsync(
        string essayText, string taskType, CancellationToken ct = default)
    {
        _ = db;
        _ = essayText;
        _ = taskType;
        _ = ct;

        return await Task.FromResult("Rubric Context Placeholder");
    }
}
