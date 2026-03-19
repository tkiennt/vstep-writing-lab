using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Threading.Tasks;
using VSTEPWritingAI.Models.DTOs.Responses;
using VSTEPWritingAI.Repositories;

namespace VSTEPWritingAI.Controllers
{
    [ApiController]
    [Route("api/tasks")]
    [Authorize]
    public class TasksController : ControllerBase
    {
        private readonly TaskRepository _taskRepo;

        public TasksController(TaskRepository taskRepo)
        {
            _taskRepo = taskRepo;
        }

        // GET /api/tasks
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var tasks = await _taskRepo.GetAllAsync();
            var response = tasks.Select(t => new TaskResponse
            {
                TaskId      = t.TaskId,
                Name        = t.Name,
                Type        = t.Type,
                Duration    = t.Duration,
                MinWords    = t.MinWords,
                ScoreWeight = t.ScoreWeight,
                Description = t.Description
            });
            return Ok(response);
        }

        // GET /api/tasks/{taskId}
        [HttpGet("{taskId}")]
        public async Task<IActionResult> GetById(string taskId)
        {
            var task = await _taskRepo.GetByIdAsync(taskId);
            if (task == null)
                return NotFound(new { message = $"Task {taskId} not found" });

            return Ok(new TaskResponse
            {
                TaskId      = task.TaskId,
                Name        = task.Name,
                Type        = task.Type,
                Duration    = task.Duration,
                MinWords    = task.MinWords,
                ScoreWeight = task.ScoreWeight,
                Description = task.Description
            });
        }
    }
}
