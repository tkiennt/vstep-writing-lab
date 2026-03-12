using Microsoft.AspNetCore.Mvc;
using VstepWritingLab.Business.Interfaces;
using VstepWritingLab.Shared.Models;

namespace VstepWritingLab.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TopicsController : ControllerBase
{
    private readonly ITopicService _topicService;

    public TopicsController(ITopicService topicService)
    {
        _topicService = topicService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<TopicDto>>>> GetTopics()
    {
        var topics = await _topicService.GetAllTopicsAsync();
        return Ok(ApiResponse<IEnumerable<TopicDto>>.SuccessResponse(topics));
    }
}
