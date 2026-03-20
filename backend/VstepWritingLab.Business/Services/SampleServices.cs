using VstepWritingLab.Business.Interfaces;
using VstepWritingLab.Shared.Models;

namespace VstepWritingLab.Business.Services;

public class TopicService : ITopicService
{
    public async Task<IEnumerable<TopicDto>> GetAllTopicsAsync()
    {
        // Sample implementation
        return await Task.FromResult(new List<TopicDto>
        {
            new() { Id = "1", Title = "Environmental Protection", Type = "Task 2" },
            new() { Id = "2", Title = "Graph Analysis", Type = "Task 1" }
        });
    }
}

public class EssayService : IEssayService
{
    public async Task<EssayDto?> GetEssayByIdAsync(string id)
    {
        return await Task.FromResult(new EssayDto { Id = id, Content = "Sample essay content" });
    }

    public async Task<EssayDto> SubmitEssayAsync(EssayDto essay)
    {
        essay.Id = Guid.NewGuid().ToString();
        essay.CreatedAt = DateTime.UtcNow;
        essay.Feedback = "Great job! Your score is 7.5";
        essay.Score = 7.5f;
        return await Task.FromResult(essay);
    }

    public async Task<IEnumerable<EssayDto>> GetUserHistoryAsync(string userId)
    {
        return await Task.FromResult(new List<EssayDto>
        {
            new() { Id = "e1", UserId = userId, Content = "History essay 1" }
        });
    }
}
