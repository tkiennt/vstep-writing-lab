using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using VSTEPWritingAI.Services;

namespace VSTEPWritingAI.Controllers
{
    [ApiController]
    [Route("api/questions")]
    [Authorize]
    public class QuestionsController : ControllerBase
    {
        private readonly QuestionService _questionService;

        public QuestionsController(QuestionService questionService)
        {
            _questionService = questionService;
        }

        // GET /api/questions?taskType=task1&level=B1
        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? taskType,
            [FromQuery] string? level)
        {
            var questions = await _questionService.GetQuestionsAsync(taskType, level);
            return Ok(questions);
        }

        // GET /api/questions/{id}?mode=guided
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(
            string id,
            [FromQuery] string? mode)
        {
            var question = await _questionService.GetQuestionDetailAsync(id, mode);
            return Ok(question);
        }
    }
}
