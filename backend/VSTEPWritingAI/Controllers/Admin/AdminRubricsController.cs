using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using VSTEPWritingAI.Services;

namespace VSTEPWritingAI.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/rubrics")]
    [Authorize(Policy = "AdminOnly")]
    public class AdminRubricsController : ControllerBase
    {
        private readonly RubricService _rubricService;

        public AdminRubricsController(RubricService rubricService)
        {
            _rubricService = rubricService;
        }

        // GET /api/admin/rubrics
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var results = await _rubricService.GetAllAsync();
            return Ok(results);
        }
    }
}
