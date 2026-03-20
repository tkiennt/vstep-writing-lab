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
    public async Task<IActionResult> Grade(
        [FromBody]  GradeEssayRequest  request,
        [FromQuery] string?            studentId,
        CancellationToken              ct)
    {
        // Extract uid from Firebase Auth middleware or query param
        var uid = studentId
               ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
               ?? HttpContext.Items["UserId"]?.ToString()
               ?? "";

        if (string.IsNullOrEmpty(uid))
            return BadRequest(new { code = "INVALID_USER", message = "Student ID is required" });

        var command = new GradeEssayCommand(
            StudentId: uid,
            EssayId:   request.EssayId,
            TaskType:  request.TaskType,
            Prompt:    request.Prompt,
            EssayText: request.EssayText,
            WordCount: request.WordCount,
            Mode:      request.Mode,
            UserHistory: request.UserHistory == null ? null : new UserHistory(
                request.UserHistory.Weaknesses,
                request.UserHistory.PastScores,
                request.UserHistory.Level)
        );

        var result = await useCase.ExecuteAsync(command, ct);

        return result.IsSuccess
            ? Ok(result.Value)
            : result.Error!.Contains("not found")
                ? NotFound(new  { code = "NOT_FOUND",  message = result.Error })
                : BadRequest(new { code = "BAD_REQUEST", message = result.Error });
    }
}
