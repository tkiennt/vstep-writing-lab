using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.IO;
using System.Threading.Tasks;
using VSTEPWritingAI.Services;

namespace VSTEPWritingAI.Controllers.Admin
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Roles = "admin")]
    public class AdminImportController : ControllerBase
    {
        private readonly DataImportService _importService;
        private readonly ILogger<AdminImportController> _logger;

        public AdminImportController(
            DataImportService importService,
            ILogger<AdminImportController> logger)
        {
            _importService = importService;
            _logger = logger;
        }

        // ── POST /api/admin/import/tasks ─────────────────────────────────────
        // Upload tasks.json file
        // Run once before system goes live

        [HttpPost("import/tasks")]
        public async Task<IActionResult> ImportTasks(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file uploaded" });

            if (!file.FileName.EndsWith(".json"))
                return BadRequest(new { message = "File must be .json" });

            using var reader = new StreamReader(file.OpenReadStream());
            var jsonContent = await reader.ReadToEndAsync();

            var result = await _importService.ImportTasksAsync(jsonContent);

            return result.Success
                ? Ok(result)
                : StatusCode(207, result); // 207 = partial success
        }

        // ── POST /api/admin/import/questions ─────────────────────────────────
        // Upload questions.json file
        // Can be run multiple times to add more questions

        [HttpPost("import/questions")]
        public async Task<IActionResult> ImportQuestions(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file uploaded" });

            if (!file.FileName.EndsWith(".json"))
                return BadRequest(new { message = "File must be .json" });

            // Limit file size to 10MB
            if (file.Length > 10 * 1024 * 1024)
                return BadRequest(new { message = "File too large (max 10MB)" });

            using var reader = new StreamReader(file.OpenReadStream());
            var jsonContent = await reader.ReadToEndAsync();

            var result = await _importService.ImportQuestionsAsync(jsonContent);

            return result.Success
                ? Ok(result)
                : StatusCode(207, result);
        }

        // ── POST /api/admin/import/sentence-templates ────────────────────────
        // Upload sentence templates JSON file
        // Can be run multiple times per category

        [HttpPost("import/sentence-templates")]
        public async Task<IActionResult> ImportSentenceTemplates(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file uploaded" });

            using var reader = new StreamReader(file.OpenReadStream());
            var jsonContent = await reader.ReadToEndAsync();

            var result = await _importService.ImportSentenceTemplatesAsync(jsonContent);

            return result.Success
                ? Ok(result)
                : StatusCode(207, result);
        }

        // ── POST /api/admin/seed/rubrics ─────────────────────────────────────
        // Seed rubrics from hardcoded VSTEP rubric data
        // Run once. Safe to re-run (uses MergeAll)

        [HttpPost("seed/rubrics")]
        public async Task<IActionResult> SeedRubrics()
        {
            var result = await _importService.SeedRubricsAsync();

            return result.Success
                ? Ok(result)
                : StatusCode(500, result);
        }
    }
}
