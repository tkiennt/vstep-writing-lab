using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using VSTEPWritingAI.Services;

namespace VSTEPWritingAI.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/submissions")]
    [Authorize(Policy = "AdminOnly")]
    public class AdminSubmissionsController : ControllerBase
    {
        private readonly AdminSubmissionService _adminSubmissionService;

        public AdminSubmissionsController(AdminSubmissionService adminSubmissionService)
        {
            _adminSubmissionService = adminSubmissionService;
        }

        // GET /api/admin/submissions
        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? status,
            [FromQuery] string? taskType,
            [FromQuery] string? userId,
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to,
            [FromQuery] int limit = 50)
        {
            var results = await _adminSubmissionService.GetAllSubmissionsAsync(
                status, taskType, userId, from, to, limit);
            return Ok(results);
        }

        // GET /api/admin/submissions/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var result = await _adminSubmissionService.GetSubmissionDetailAsync(id);
            return Ok(result);
        }
    }
}
