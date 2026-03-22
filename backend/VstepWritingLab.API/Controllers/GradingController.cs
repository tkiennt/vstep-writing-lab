using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using VstepWritingLab.Business.DTOs;
using VstepWritingLab.Business.Mapping;
using VstepWritingLab.Business.UseCases;
using VstepWritingLab.Domain.Interfaces;

namespace VstepWritingLab.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class GradingController(
    IGradeEssayUseCase useCase,
    IGradingResultRepository gradingResults) : ControllerBase
{
    [HttpPost("grade")]
    public async Task<IActionResult> GradeEssay([FromBody] GradeEssayRequest request, CancellationToken ct)
    {
        // Use student ID from token if not provided in request or to override it
        var studentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? request.UserUid;
        
        if (string.IsNullOrEmpty(studentId))
            return BadRequest(new { code = "INVALID_USER", message = "Student ID is required" });

        // Update request with the authenticated user ID
        var updatedRequest = request with { UserUid = studentId };

        var result = await useCase.ExecuteAsync(updatedRequest, ct);
        
        if (!result.IsSuccess) 
            return BadRequest(new { code = "GRADING_FAILED", message = result.Error });
            
        return Ok(result.Value);
    }

    /// <summary>Danh sách bài đã chấm (Firestore grading_results), mới nhất trước.</summary>
    [HttpGet("history")]
    public async Task<IActionResult> GetHistory([FromQuery] int limit = 30, CancellationToken ct = default)
    {
        var studentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(studentId))
            return Unauthorized();

        var list = await gradingResults.GetHistorySummariesAsync(studentId, limit, ct);
        return Ok(list);
    }

    /// <summary>Chi tiết một lần chấm + bài viết đã lưu.</summary>
    [HttpGet("history/{id}")]
    public async Task<IActionResult> GetHistoryDetail(string id, CancellationToken ct = default)
    {
        var studentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(studentId))
            return Unauthorized();

        var row = await gradingResults.GetWithEssayForStudentAsync(studentId, id, ct);
        if (row == null)
            return NotFound();

        var (result, essayText) = row.Value;
        var analysis = GradingMapper.ToFullAnalysisResponse(result);
        return Ok(new GradingHistoryDetailResponse(analysis, essayText));
    }
}
