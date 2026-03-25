using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using VstepWritingLab.Business.Services;

namespace VstepWritingLab.API.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/ai-monitor")]
    [Authorize(Roles = "admin")]
    public class AdminAiMonitorController : ControllerBase
    {
        private readonly AdminAiMonitorService _aiMonitorService;

        public AdminAiMonitorController(AdminAiMonitorService aiMonitorService)
        {
            _aiMonitorService = aiMonitorService;
        }

        [HttpGet("logs")]
        public async Task<IActionResult> GetLogs([FromQuery] int count = 50)
        {
            var logs = await _aiMonitorService.GetRecentLogsAsync(count);
            return Ok(logs);
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var stats = await _aiMonitorService.GetUsageStatsAsync();
            return Ok(stats);
        }
    }
}
