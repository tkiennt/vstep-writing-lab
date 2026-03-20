using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using VSTEPWritingAI.Exceptions;
using VSTEPWritingAI.Helpers;
using VSTEPWritingAI.Models.DTOs.Requests;
using VSTEPWritingAI.Services;

namespace VSTEPWritingAI.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;

        public AuthController(AuthService authService)
        {
            _authService = authService;
        }

        // POST /api/auth/register
        // Body: { "firebaseToken": "...", "displayName": "..." }
        // Called once after Firebase signup on frontend

        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.FirebaseToken))
                return BadRequest(new { message = "firebaseToken is required" });

            if (string.IsNullOrWhiteSpace(request.DisplayName))
                return BadRequest(new { message = "displayName is required" });

            try
            {
                var user = await _authService.RegisterAsync(
                    request.FirebaseToken,
                    request.DisplayName);

                return Ok(new
                {
                    userId      = user.UserId,
                    email       = user.Email,
                    displayName = user.DisplayName,
                    role        = user.Role
                });
            }
            catch (UnauthorizedException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }

        // GET /api/auth/me
        // Returns current user profile from Firestore
        // Requires: valid Firebase JWT token

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> Me()
        {
            var uid  = this.GetUserId();
            var user = await _authService.GetCurrentUserAsync(uid);

            if (user == null)
                return NotFound(new { message = "User not found" });

            return Ok(new
            {
                userId      = user.UserId,
                email       = user.Email,
                displayName = user.DisplayName,
                role        = user.Role,
                isActive    = user.IsActive,
                createdAt   = user.CreatedAt.ToDateTime()
            });
        }
    }
}
