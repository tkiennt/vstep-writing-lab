using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VstepWritingLab.Shared.Models;

namespace VstepWritingLab.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        // This is a placeholder. Client-side Firebase SDK handles the actual login.
        // The backend verifies the ID token provided by the client.
        return Ok(ApiResponse<string>.SuccessResponse("Client-side login required. Send the Firebase ID Token in the Authorization header."));
    }

    [Authorize]
    [HttpGet("me")]
    public IActionResult GetMe()
    {
        var userId = User.Claims.FirstOrDefault(c => c.Type == "user_id")?.Value;
        return Ok(ApiResponse<object>.SuccessResponse(new { UserId = userId }, "Authenticated user details retrieved."));
    }
}
