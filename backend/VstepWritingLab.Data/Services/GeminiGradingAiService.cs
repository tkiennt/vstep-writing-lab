using VstepWritingLab.Domain.Interfaces;
using VstepWritingLab.Domain.ValueObjects;
using System.Net.Http.Json;

namespace VstepWritingLab.Data.Services;

public class GeminiGradingAiService(IHttpClientFactory httpClientFactory) : IGradingAiService
{
    public async Task<Result<AiGradingOutput>> GradeAsync(
        string rubricContext, string taskType, string instruction,
        string[] keyPoints, int wordCount, string essayText,
        CancellationToken ct = default)
    {
        _ = httpClientFactory;
        _ = rubricContext;
        _ = taskType;
        _ = instruction;
        _ = keyPoints;
        _ = wordCount;
        _ = essayText;
        _ = ct;

        return await Task.FromResult(Result<AiGradingOutput>.Fail("Not implemented yet"));
    }
}
