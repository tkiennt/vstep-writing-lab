using VstepWritingLab.Shared.Models;

namespace VstepWritingLab.Business.Interfaces;

public interface ITopicService
{
    Task<IEnumerable<TopicDto>> GetAllTopicsAsync();
}

public interface IEssayService
{
    Task<EssayDto?> GetEssayByIdAsync(string id);
    Task<EssayDto> SubmitEssayAsync(EssayDto essay);
    Task<IEnumerable<EssayDto>> GetUserHistoryAsync(string userId);
}
