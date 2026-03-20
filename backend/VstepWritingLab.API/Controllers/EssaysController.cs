using Microsoft.AspNetCore.Mvc;
using VstepWritingLab.Business.Interfaces;
using VstepWritingLab.Shared.Models;

namespace VstepWritingLab.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EssaysController : ControllerBase
{
    private readonly IEssayService _essayService;

    public EssaysController(IEssayService essayService)
    {
        _essayService = essayService;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<EssayDto>>> GetEssay(string id)
    {
        var essay = await _essayService.GetEssayByIdAsync(id);
        if (essay == null) return NotFound(ApiResponse<EssayDto>.ErrorResponse("Essay not found"));
        return Ok(ApiResponse<EssayDto>.SuccessResponse(essay));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<EssayDto>>> SubmitEssay(EssayDto essayDto)
    {
        var result = await _essayService.SubmitEssayAsync(essayDto);
        return Ok(ApiResponse<EssayDto>.SuccessResponse(result, "Essay submitted and graded successfully"));
    }
}
