using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using VstepWritingLab.Business.DTOs;
using VstepWritingLab.Business.UseCases;

namespace VstepWritingLab.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class GradingController(IGradeEssayUseCase useCase) : ControllerBase
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
}
