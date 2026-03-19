using Microsoft.AspNetCore.Mvc;
using VstepWritingLab.Business.DTOs;
using VstepWritingLab.Business.UseCases;

namespace VstepWritingLab.API.Controllers;

[ApiController]
[Route("api/v2/[controller]")]
public class GradingController(IGradeEssayUseCase useCase) : ControllerBase
{
    [HttpPost("grade")]
    public async Task<IActionResult> GradeEssay([FromBody] GradeEssayRequest request)
    {
        var result = await useCase.ExecuteAsync(request);
        if (!result.IsSuccess) return BadRequest(result.Error);
        return Ok(result.Value);
    }
}
