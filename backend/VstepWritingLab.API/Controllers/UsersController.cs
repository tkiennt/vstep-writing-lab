using Microsoft.AspNetCore.Mvc;
using VstepWritingLab.Business.Interfaces;
using VstepWritingLab.Shared.Models;

namespace VstepWritingLab.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IEssayService _essayService;

    public UsersController(IEssayService essayService)
    {
        _essayService = essayService;
    }

    [HttpGet("{id}/history")]
    public async Task<ActionResult<ApiResponse<IEnumerable<EssayDto>>>> GetHistory(string id)
    {
        var history = await _essayService.GetUserHistoryAsync(id);
        return Ok(ApiResponse<IEnumerable<EssayDto>>.SuccessResponse(history));
    }
}
