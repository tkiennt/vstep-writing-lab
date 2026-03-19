using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using VstepWritingLab.Business.Services;

namespace VstepWritingLab.API.Controllers.Admin
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Roles = "admin")] // Policy based authorization will be set up in Program.cs
    public class AdminAnalyticsController : ControllerBase
    {
        private readonly AdminAnalyticsService _analyticsService;

        public AdminAnalyticsController(AdminAnalyticsService analyticsService)
        {
            _analyticsService = analyticsService;
        }

        [HttpGet("analytics")]
        public async Task<IActionResult> GetAnalytics()
        {
            var analytics = await _analyticsService.GetAnalyticsAsync();
            return Ok(analytics);
        }

        [HttpGet("ai-logs")]
        public async Task<IActionResult> GetAiLogs(
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to)
        {
            var logs = await _analyticsService.GetAiLogsAsync(from, to);
            return Ok(logs);
        }
    }
}
