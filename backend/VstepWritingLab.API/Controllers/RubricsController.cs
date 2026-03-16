using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using VstepWritingLab.Business.Services;

namespace VstepWritingLab.API.Controllers
{
    [ApiController]
    [Route("api/rubrics")]
    public class RubricsController : ControllerBase
    {
        private readonly RubricService _rubricService;

        public RubricsController(RubricService rubricService)
        {
            _rubricService = rubricService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            var rubrics = await _rubricService.GetAllAsync();
            return Ok(rubrics);
        }

        [HttpGet("{rubricId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(string rubricId)
        {
            var rubric = await _rubricService.GetByIdAsync(rubricId);
            return Ok(rubric);
        }
    }
}
