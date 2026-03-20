using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using VstepWritingLab.Business.DTOs;
using VstepWritingLab.Business.UseCases;

namespace VstepWritingLab.API.Controllers;

[ApiController]
[Route("api/v2/[controller]")]
[Authorize]
public class SessionsController(
    IStartSessionUseCase _startSessionUseCase,
    IUpdateSessionUseCase _updateSessionUseCase) : ControllerBase
{
    [HttpPost("start")]
    public async Task<IActionResult> Start([FromBody] StartSessionRequest request, CancellationToken ct)
    {
        var uid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                ?? HttpContext.Items["UserId"]?.ToString() 
                ?? "";

        if (string.IsNullOrEmpty(uid))
            return BadRequest(new { code = "INVALID_USER", message = "User ID is required" });

        var result = await _startSessionUseCase.ExecuteAsync(uid, request, ct);
        return result.IsSuccess ? Ok(result.Value) : BadRequest(new { message = result.Error });
    }

    [HttpPatch("{id}/update")]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateSessionRequest request, CancellationToken ct)
    {
        var uid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                ?? HttpContext.Items["UserId"]?.ToString() 
                ?? "";

        if (string.IsNullOrEmpty(uid))
            return BadRequest(new { code = "INVALID_USER", message = "User ID is required" });

        var result = await _updateSessionUseCase.ExecuteAsync(uid, id, request, ct);
        return result.IsSuccess ? Ok(result.Value) : BadRequest(new { message = result.Error });
    }
}
