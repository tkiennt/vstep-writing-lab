using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using VstepWritingLab.Business.Services;

namespace VstepWritingLab.API.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/audit")]
    [Authorize(Roles = "admin")]
    public class AdminAuditLogController : ControllerBase
    {
        private readonly AdminAuditLogService _auditLogService;

        public AdminAuditLogController(AdminAuditLogService auditLogService)
        {
            _auditLogService = auditLogService;
        }

        [HttpGet("logs")]
        public async Task<IActionResult> GetLogs([FromQuery] int count = 100)
        {
            var logs = await _auditLogService.GetRecentLogsAsync(count);
            return Ok(logs);
        }
    }
}
