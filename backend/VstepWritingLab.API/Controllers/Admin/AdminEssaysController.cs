using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using VstepWritingLab.Business.Services;

namespace VstepWritingLab.API.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/essays")]
    [Authorize(Roles = "admin")]
    public class AdminEssaysController : ControllerBase
    {
        private readonly AdminEssayService _adminEssayService;

        public AdminEssaysController(AdminEssayService adminEssayService)
        {
            _adminEssayService = adminEssayService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var essays = await _adminEssayService.GetAllEssaysAsync();
            return Ok(essays);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var essay = await _adminEssayService.GetEssayByIdAsync(id);
            if (essay == null) return NotFound();
            return Ok(essay);
        }

        [HttpPatch("{id}/score")]
        public async Task<IActionResult> UpdateScore(string id, [FromQuery] double score)
        {
            await _adminEssayService.UpdateEssayScoreAsync(id, score);
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            await _adminEssayService.DeleteEssayAsync(id);
            return NoContent();
        }
    }
}
