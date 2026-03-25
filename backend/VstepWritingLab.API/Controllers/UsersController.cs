using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VstepWritingLab.Business.Interfaces;
using VstepWritingLab.Business.Services;
using VstepWritingLab.Shared.Models;
using VstepWritingLab.Shared.Models.DTOs.Requests;
using VstepWritingLab.Shared.Models.DTOs.Responses;

namespace VstepWritingLab.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IEssayService _essayService;
    private readonly IUserService _userService;

    public UsersController(IEssayService essayService, IUserService userService)
    {
        _essayService = essayService;
        _userService = userService;
    }

    [HttpGet("me")]
    public async Task<ActionResult<ApiResponse<UserProfileResponse>>> GetProfile()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var profile = await _userService.GetProfileAsync(userId);
        if (profile == null) return NotFound();

        return Ok(ApiResponse<UserProfileResponse>.SuccessResponse(profile));
    }

    [HttpPut("me")]
    public async Task<ActionResult<ApiResponse<UserProfileResponse>>> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var updated = await _userService.UpdateProfileAsync(userId, request);
        return Ok(ApiResponse<UserProfileResponse>.SuccessResponse(updated));
    }

    [HttpGet("{id}/history")]
    public async Task<ActionResult<ApiResponse<IEnumerable<EssayDto>>>> GetHistory(string id)
    {
        var history = await _essayService.GetUserHistoryAsync(id);
        return Ok(ApiResponse<IEnumerable<EssayDto>>.SuccessResponse(history));
    }
}
