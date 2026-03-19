using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using VstepWritingLab.Business.UseCases;
using VstepWritingLab.Business.Interfaces;

namespace VstepWritingLab.API.Controllers;

[ApiController]
[Route("api/v2/[controller]")]
public class ExamPromptsController : ControllerBase
{
    private readonly IExamPromptUseCase _useCase;
    private readonly IOutlineService _outlineService;
    private readonly IMemoryCache _cache;
    private static readonly TimeSpan _cacheTtl = TimeSpan.FromMinutes(5);

    public ExamPromptsController(IExamPromptUseCase useCase, IOutlineService outlineService, IMemoryCache cache)
    {
        _useCase = useCase;
        _outlineService = outlineService;
        _cache = cache;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? taskType = null, [FromQuery] string? cefrLevel = null)
    {
        var cacheKey = $"exam_prompts:{taskType}:{cefrLevel}";
        if (!_cache.TryGetValue(cacheKey, out var cached))
        {
            var result = await _useCase.GetPromptsByTypeAsync(taskType);
            cached = result.Value;
            _cache.Set(cacheKey, cached, _cacheTtl);
        }
        return Ok(cached);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var cacheKey = $"exam_prompt:{id}";
        if (!_cache.TryGetValue(cacheKey, out var cached))
        {
            var result = await _useCase.GetByIdAsync(id);
            if (!result.IsSuccess) return NotFound(result.Error);
            cached = result.Value;
            _cache.Set(cacheKey, cached, _cacheTtl);
        }
        return Ok(cached);
    }

    [HttpGet("{id}/outline")]
    public async Task<IActionResult> GetOutline(string id)
    {
        var promptResult = await _useCase.GetByIdAsync(id);
        if (!promptResult.IsSuccess) return NotFound(promptResult.Error);

        var outline = await _outlineService.GenerateOutlineAsync(promptResult.Value.Instruction, promptResult.Value.TaskType);
        return Ok(outline);
    }
}
