using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using VSTEPWritingAI.Services;

namespace VSTEPWritingAI.Controllers.Admin
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Policy = "AdminOnly")]
    public class AdminAnalyticsController : ControllerBase
    {
        private readonly AdminAnalyticsService _analyticsService;

        public AdminAnalyticsController(AdminAnalyticsService analyticsService)
        {
            _analyticsService = analyticsService;
        }

        // GET /api/admin/analytics
        [HttpGet("analytics")]
        public async Task<IActionResult> GetAnalytics()
        {
            var analytics = await _analyticsService.GetAnalyticsAsync();
            return Ok(analytics);
        }

        // GET /api/admin/ai-logs?from=2024-01-01&to=2024-06-30
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
