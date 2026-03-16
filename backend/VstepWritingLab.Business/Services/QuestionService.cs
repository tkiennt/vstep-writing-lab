using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VstepWritingLab.Shared.Models.DTOs.Responses;
using VstepWritingLab.Data.Repositories;

namespace VstepWritingLab.Business.Services
{
    public class QuestionService
    {
        private readonly QuestionRepository _questionRepo;
        private readonly TaskRepository _taskRepo;
        private readonly SentenceTemplateRepository _templateRepo;

        public QuestionService(
            QuestionRepository questionRepo,
            TaskRepository taskRepo,
            SentenceTemplateRepository templateRepo)
        {
            _questionRepo = questionRepo;
            _taskRepo     = taskRepo;
            _templateRepo = templateRepo;
        }

        public async Task<List<QuestionResponse>> GetQuestionsAsync(
            string? taskType,
            string? level)
        {
            var questions = await _questionRepo.GetActiveAsync(taskType, level);

            return questions.Select(q => new QuestionResponse
            {
                QuestionId   = q.QuestionId,
                TaskType     = q.TaskType,
                Category     = q.Category,
                Title        = q.Title,
                Instructions = q.Instructions,
                Requirements = q.Requirements,
                Level        = q.Level
            }).ToList();
        }

        public async Task<QuestionDetailResponse> GetQuestionDetailAsync(
            string questionId,
            string? mode = null)
        {
            var question = await _questionRepo.GetByIdAsync(questionId);
            if (question == null || !question.IsActive)
                throw new System.Exception($"Question {questionId} not found");

            var task = await _taskRepo.GetByIdAsync(question.TaskType);

            var response = new QuestionDetailResponse
            {
                QuestionId       = question.QuestionId,
                TaskType         = question.TaskType,
                Category         = question.Category,
                Title            = question.Title,
                Instructions     = question.Instructions,
                Requirements     = question.Requirements,
                Level            = question.Level,
                Task             = task == null ? null : new TaskResponse
                {
                    TaskId      = task.TaskId,
                    Name        = task.Name,
                    Type        = task.Type,
                    Duration    = task.Duration,
                    MinWords    = task.MinWords,
                    ScoreWeight = task.ScoreWeight,
                    Description = task.Description
                },
                SentenceTemplates = new List<SentenceTemplateResponse>()
            };

            if (mode == "guided")
            {
                var templates = await _templateRepo.GetByCategoryAsync(
                    question.TaskType, question.Category);

                response.SentenceTemplates = templates
                    .OrderBy(t => GetPartOrder(t.Part))
                    .Select(t => new SentenceTemplateResponse
                    {
                        Part      = t.Part,
                        Templates = t.Templates
                    }).ToList();
            }

            return response;
        }

        private int GetPartOrder(string part) => part switch
        {
            "introduction" => 1,
            "body"         => 2,
            "closing"      => 3,
            "conclusion"   => 3,
            _              => 99
        };
    }
}
