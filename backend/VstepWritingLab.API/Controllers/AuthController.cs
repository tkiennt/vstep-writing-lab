using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using VstepWritingLab.Shared.Exceptions;
using VstepWritingLab.API.Helpers;
using VstepWritingLab.Shared.Models.DTOs.Requests;
using VstepWritingLab.Business.Services;

namespace VstepWritingLab.API.Controllers
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

        [HttpPost("sync")]
        [AllowAnonymous]
        public async Task<IActionResult> Sync()
        {
            var authHeader = Request.Headers["Authorization"].ToString();
            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
                return Unauthorized(new { message = "Bearer token required" });

            var token = authHeader.Substring(7);

            try
            {
                var (user, isNew) = await _authService.SyncUserAsync(token);

                var response = new
                {
                    userId = user.UserId,
                    email = user.Email,
                    displayName = user.DisplayName,
                    avatarUrl = user.AvatarUrl,
                    role = user.Role,
                    onboardingCompleted = user.OnboardingCompleted,
                    currentLevel = user.CurrentLevel,
                    targetLevel = user.TargetLevel,
                    isNewUser = isNew
                };

                if (isNew)
                    return Created($"/api/users/{user.UserId}", response);

                return Ok(response);
            }
            catch (Exception ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }

        [HttpPut("onboarding")]
        [Authorize]
        public async Task<IActionResult> UpdateOnboarding([FromBody] OnboardingRequest request)
        {
            var uid = this.GetUserId();
            if (string.IsNullOrEmpty(uid)) 
                return Unauthorized();

            if (string.IsNullOrWhiteSpace(request.DisplayName) || 
                string.IsNullOrWhiteSpace(request.CurrentLevel) || 
                string.IsNullOrWhiteSpace(request.TargetLevel))
            {
                return BadRequest(new { message = "All fields are required" });
            }

            try
            {
                await _authService.UpdateOnboardingAsync(uid, request.DisplayName, request.CurrentLevel, request.TargetLevel);
                return Ok(new { message = "Onboarding completed" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

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
