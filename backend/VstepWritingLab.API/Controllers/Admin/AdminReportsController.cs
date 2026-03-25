using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using VstepWritingLab.Business.Services;

namespace VstepWritingLab.API.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/reports")]
    [Authorize(Roles = "admin")]
    public class AdminReportsController : ControllerBase
    {
        private readonly AdminReportsService _reportsService;

        public AdminReportsController(AdminReportsService reportsService)
        {
            _reportsService = reportsService;
        }

        [HttpGet("trends")]
        public async Task<IActionResult> GetTrends([FromQuery] int days = 30)
        {
            var trends = await _reportsService.GetDailyTrendsAsync(days);
            return Ok(trends);
        }

        [HttpGet("distribution")]
        public async Task<IActionResult> GetDistribution()
        {
            var dist = await _reportsService.GetScoreDistributionAsync();
            return Ok(dist);
        }

        [HttpGet("export/csv")]
        public async Task<IActionResult> ExportCsv()
        {
            var bytes = await _reportsService.GenerateSubmissionsCsvAsync();
            return File(bytes, "text/csv", "submissions_report.csv");
        }

        [HttpGet("ai-trends")]
        public async Task<IActionResult> GetAiTrends([FromQuery] int days = 30)
        {
            var trends = await _reportsService.GetAiUsageTrendsAsync(days);
            return Ok(trends);
        }
    }
}
