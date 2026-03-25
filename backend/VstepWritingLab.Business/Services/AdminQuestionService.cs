using Google.Cloud.Firestore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VstepWritingLab.Shared.Models.DTOs.Requests;
using VstepWritingLab.Shared.Models.DTOs.Responses;
using VstepWritingLab.Shared.Models.Entities;
using VstepWritingLab.Business.Interfaces;

namespace VstepWritingLab.Business.Services
{
    public class AdminQuestionService
    {
        private readonly IQuestionRepository _questionRepo;

        public AdminQuestionService(IQuestionRepository questionRepo)
        {
            _questionRepo = questionRepo;
        }

        public async Task<List<QuestionResponse>> GetAllAsync()
        {
            var questions = await _questionRepo.GetAllAsync();
            return questions.Select(MapToResponse).ToList();
        }

        public async Task<QuestionResponse> CreateAsync(
            CreateQuestionRequest request)
        {
            ValidateCreateRequest(request);

            var question = new QuestionModel
            {
                QuestionId   = Guid.NewGuid().ToString("N")[..8], // e.g. "a1b2c3d4"
                TaskType     = request.TaskType,
                Category     = request.Category,
                Title        = request.Title,
                Instructions = request.Instructions,
                Requirements = request.Requirements ?? new List<string>(),
                Level        = request.Level,
                IsActive     = true,
                ImportedAt   = Timestamp.GetCurrentTimestamp()
            };

            await _questionRepo.SetAsync(question.QuestionId, question);
            return MapToResponse(question);
        }

        public async Task<QuestionResponse> UpdateAsync(
            string questionId,
            UpdateQuestionRequest request)
        {
            var question = await _questionRepo.GetByIdAsync(questionId);
            if (question == null)
                throw new Exception($"Question {questionId} not found");

            var updates = new Dictionary<string, object>();
            if (request.Title        != null) updates["Title"]        = request.Title;
            if (request.Instructions != null) updates["Instructions"] = request.Instructions;
            if (request.Requirements != null) updates["Requirements"] = request.Requirements;
            if (request.Level        != null) updates["Level"]        = request.Level;
            if (request.IsActive.HasValue)    updates["IsActive"]     = request.IsActive.Value;

            if (updates.Any())
                await _questionRepo.UpdateAsync(questionId, updates);

            var updated = await _questionRepo.GetByIdAsync(questionId);
            return MapToResponse(updated!);
        }

        public async Task DeleteAsync(string questionId)
        {
            var question = await _questionRepo.GetByIdAsync(questionId);
            if (question == null)
                throw new Exception($"Question {questionId} not found");

            // Soft delete — set isActive = false
            await _questionRepo.UpdateAsync(questionId,
                new Dictionary<string, object> { { "IsActive", false } });
        }

        private void ValidateCreateRequest(CreateQuestionRequest r)
        {
            var errors = new List<string>();
            if (string.IsNullOrWhiteSpace(r.TaskType))   errors.Add("taskType is required");
            if (string.IsNullOrWhiteSpace(r.Category))   errors.Add("category is required");
            if (string.IsNullOrWhiteSpace(r.Title))      errors.Add("title is required");
            if (string.IsNullOrWhiteSpace(r.Instructions)) errors.Add("instructions is required");
            if (string.IsNullOrWhiteSpace(r.Level))      errors.Add("level is required");
            if (r.TaskType != "task1" && r.TaskType != "task2")
                errors.Add("taskType must be 'task1' or 'task2'");
            if (r.Level != "B1" && r.Level != "B2" && r.Level != "C1")
                errors.Add("level must be 'B1', 'B2', or 'C1'");
            
            if (errors.Any()) throw new Exception($"Validation failed: {string.Join(", ", errors)}");
        }

        private QuestionResponse MapToResponse(QuestionModel q) =>
            new QuestionResponse
            {
                QuestionId   = q.QuestionId,
                TaskType     = q.TaskType,
                Category     = q.Category,
                Title        = q.Title,
                Instructions = q.Instructions,
                Requirements = q.Requirements,
                Level        = q.Level,
                CreatedAt    = q.ImportedAt.ToDateTime()
            };
    }
}
