using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using VSTEPWritingAI.Models.DTOs.Requests;
using VSTEPWritingAI.Services;

namespace VSTEPWritingAI.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/questions")]
    [Authorize(Policy = "AdminOnly")]
    public class AdminQuestionsController : ControllerBase
    {
        private readonly AdminQuestionService _adminQuestionService;

        public AdminQuestionsController(AdminQuestionService adminQuestionService)
        {
            _adminQuestionService = adminQuestionService;
        }

        // GET /api/admin/questions
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var questions = await _adminQuestionService.GetAllAsync();
            return Ok(questions);
        }

        // GET /api/admin/questions/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var question = await _adminQuestionService.GetByIdAsync(id);
            return Ok(question);
        }

        // POST /api/admin/questions
        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] CreateQuestionRequest request)
        {
            var created = await _adminQuestionService.CreateAsync(request);
            return CreatedAtAction(nameof(GetAll), created);
        }

        // PATCH /api/admin/questions/{id}
        [HttpPatch("{id}")]
        public async Task<IActionResult> Update(
            string id,
            [FromBody] UpdateQuestionRequest request)
        {
            var updated = await _adminQuestionService.UpdateAsync(id, request);
            return Ok(updated);
        }

        // DELETE /api/admin/questions/{id}  — soft delete
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            await _adminQuestionService.DeleteAsync(id);
            return NoContent();
        }

        // PATCH /api/admin/questions/{id}/restore
        [HttpPatch("{id}/restore")]
        public async Task<IActionResult> Restore(string id)
        {
            await _adminQuestionService.RestoreAsync(id);
            return Ok(new { questionId = id, isActive = true });
        }
    }
}
