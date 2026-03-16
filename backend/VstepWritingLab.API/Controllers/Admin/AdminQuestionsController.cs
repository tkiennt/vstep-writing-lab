using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using VstepWritingLab.Shared.Models.DTOs.Requests;
using VstepWritingLab.Business.Services;

namespace VstepWritingLab.API.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/questions")]
    [Authorize(Roles = "admin")]
    public class AdminQuestionsController : ControllerBase
    {
        private readonly AdminQuestionService _adminQuestionService;

        public AdminQuestionsController(AdminQuestionService adminQuestionService)
        {
            _adminQuestionService = adminQuestionService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var questions = await _adminQuestionService.GetAllAsync();
            return Ok(questions);
        }

        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] CreateQuestionRequest request)
        {
            var created = await _adminQuestionService.CreateAsync(request);
            return CreatedAtAction(nameof(GetAll), created);
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> Update(
            string id,
            [FromBody] UpdateQuestionRequest request)
        {
            var updated = await _adminQuestionService.UpdateAsync(id, request);
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            await _adminQuestionService.DeleteAsync(id);
            return NoContent();
        }
    }
}
