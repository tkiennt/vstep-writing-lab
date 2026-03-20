using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using VstepWritingLab.API.Helpers;
using VstepWritingLab.Shared.Models.DTOs.Requests;
using VstepWritingLab.Business.Services;

namespace VstepWritingLab.API.Controllers
{
    [ApiController]
    [Route("api/submissions")]
    [Authorize]
    public class SubmissionsController : ControllerBase
    {
        private readonly SubmissionService _submissionService;

        public SubmissionsController(SubmissionService submissionService)
        {
            _submissionService = submissionService;
        }

        [HttpPost]
        public async Task<IActionResult> Submit([FromBody] SubmitEssayRequest request)
        {
            var uid    = this.GetUserId();
            var result = await _submissionService.SubmitEssayAsync(uid, request);
            return CreatedAtAction(nameof(GetById),
                new { id = result.SubmissionId }, result);
        }

        [HttpGet]
        public async Task<IActionResult> GetHistory([FromQuery] int limit = 20)
        {
            var uid     = this.GetUserId();
            var history = await _submissionService.GetHistoryAsync(uid, limit);
            return Ok(history);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var uid    = this.GetUserId();
            var result = await _submissionService.GetByIdAsync(uid, id);
            return Ok(result);
        }

        [HttpPost("{id}/retry")]
        public async Task<IActionResult> Retry(string id)
        {
            var uid    = this.GetUserId();
            var result = await _submissionService.RetryAsync(uid, id);
            return Ok(result);
        }
    }
}
