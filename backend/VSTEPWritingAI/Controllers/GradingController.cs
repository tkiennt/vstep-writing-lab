using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using VSTEPWritingAI.Models.Firestore;
using VSTEPWritingAI.Services;

namespace VSTEPWritingAI.Controllers
{
    [ApiController]
    [Route("api")]
    public class GradingController : ControllerBase
    {
        private readonly GradingService _service;

        public GradingController(GradingService service)
        {
            _service = service;
        }

        [HttpPost("grading/grade")]
        public async Task<IActionResult> GradeEssay([FromBody] Essay essay)
        {
            var result = await _service.GradeEssayAsync(essay);
            return Ok(result);
        }

        [HttpGet("progress/{studentId}")]
        public async Task<IActionResult> GetProgress(string studentId)
        {
            var result = await _service.GetProgressAsync(studentId);
            if (result == null) return NotFound("No progress found for student");
            return Ok(result);
        }

        [HttpGet("progress/{studentId}/history")]
        public async Task<IActionResult> GetHistory(string studentId)
        {
            var result = await _service.GetHistoryAsync(studentId);
            return Ok(result);
        }

        [HttpGet("progress/{studentId}/report")]
        public async Task<IActionResult> GetReport(string studentId, [FromQuery] string format = "json")
        {
            var report = await _service.GetReportAsync(studentId);

            if (format.ToLower() == "pdf")
            {
                // TODO: Render PDF from JSON using a library like iTextSharp or QuestPDF
                return File(new byte[0], "application/pdf", $"{studentId}_report.pdf");
            }

            return Ok(report);
        }
    }
}
