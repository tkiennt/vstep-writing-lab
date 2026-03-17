using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using VSTEPWritingAI.Services;

namespace VSTEPWritingAI.Controllers
{
    [ApiController]
    [Route("api/rubrics")]
    [Authorize] // Docs say [Any auth] eventually, temporarily [Public]. I'll use Authorize as requested eventually.
    // Actually, doc says: GET /api/rubrics [Public] <- tạm thời, đổi sang [Any auth] sau
    public class RubricsController : ControllerBase
    {
        private readonly RubricService _rubricService;

        public RubricsController(RubricService rubricService)
        {
            _rubricService = rubricService;
        }

        // GET /api/rubrics
        [HttpGet]
        [AllowAnonymous] // Matching doc: [Public] for now
        public async Task<IActionResult> GetAll()
        {
            var rubrics = await _rubricService.GetAllAsync();
            return Ok(rubrics);
        }

        // GET /api/rubrics/{rubricId}
        [HttpGet("{rubricId}")]
        [AllowAnonymous] // Matching doc: [Public] for now
        public async Task<IActionResult> GetById(string rubricId)
        {
            var rubric = await _rubricService.GetByIdAsync(rubricId);
            return Ok(rubric);
        }
    }
}
