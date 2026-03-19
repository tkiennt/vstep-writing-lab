using VstepWritingLab.Business.Services;

namespace VstepWritingLab.Business.Interfaces
{
    public interface IOutlineService
    {
        Task<List<OutlineStepDto>> GenerateOutlineAsync(string instruction, string taskType);
    }

    public class OutlineStepDto
    {
        public int Index { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Hint { get; set; } = string.Empty;
    }
}
