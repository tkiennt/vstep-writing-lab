using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using VstepWritingLab.Business.Services;

namespace VstepWritingLab.API.Controllers
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

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? taskType,
            [FromQuery] string? level)
        {
            var questions = await _questionService.GetQuestionsAsync(taskType, level);
            return Ok(questions);
        }

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
