using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using VSTEPWritingAI.Helpers;
using VSTEPWritingAI.Services;

namespace VSTEPWritingAI.Controllers
{
    [ApiController]
    [Route("api/progress")]
    [Authorize]
    public class ProgressController : ControllerBase
    {
        private readonly ProgressService _progressService;

        public ProgressController(ProgressService progressService)
        {
            _progressService = progressService;
        }

        // GET /api/progress
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var uid      = this.GetUserId();
            var progress = await _progressService.GetByUserIdAsync(uid);
            return Ok(progress);
        }
    }
}
