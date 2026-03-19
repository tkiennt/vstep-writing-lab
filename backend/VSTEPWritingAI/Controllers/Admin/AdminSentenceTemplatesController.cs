using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using VSTEPWritingAI.Models.DTOs.Requests;
using VSTEPWritingAI.Services;

namespace VSTEPWritingAI.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/sentence-templates")]
    [Authorize(Policy = "AdminOnly")]
    public class AdminSentenceTemplatesController : ControllerBase
    {
        private readonly SentenceTemplateService _templateService;

        public AdminSentenceTemplatesController(SentenceTemplateService templateService)
        {
            _templateService = templateService;
        }

        // GET /api/admin/sentence-templates
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var templates = await _templateService.GetAllAsync();
            return Ok(templates);
        }

        // GET /api/admin/sentence-templates/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var template = await _templateService.GetByIdAsync(id);
            return Ok(template);
        }

        // POST /api/admin/sentence-templates
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateSentenceTemplateRequest request)
        {
            var created = await _templateService.CreateAsync(request);
            return CreatedAtAction(nameof(GetById), new { id = created.TemplateId }, created);
        }

        // PATCH /api/admin/sentence-templates/{id}
        [HttpPatch("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] UpdateSentenceTemplateRequest request)
        {
            var updated = await _templateService.UpdateAsync(id, request);
            return Ok(updated);
        }

        // DELETE /api/admin/sentence-templates/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            await _templateService.DeleteAsync(id);
            return NoContent();
        }
    }
}
