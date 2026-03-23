using System.Threading.Tasks;

namespace VstepWritingLab.Business.Interfaces
{
    public interface IAiClient
    {
        Task<(string Text, string ModelUsed)> GenerateAsync(
            string systemPrompt,
            string userPrompt,
            int maxTokens = 4096,
            float temperature = 0.1f,
            CancellationToken ct = default);
    }
}
