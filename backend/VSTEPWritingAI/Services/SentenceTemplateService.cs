using Google.Cloud.Firestore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VSTEPWritingAI.Exceptions;
using VSTEPWritingAI.Models.DTOs.Requests;
using VSTEPWritingAI.Models.DTOs.Responses;
using VSTEPWritingAI.Models.Firestore;
using VSTEPWritingAI.Repositories;

namespace VSTEPWritingAI.Services
{
    public class SentenceTemplateService
    {
        private readonly SentenceTemplateRepository _templateRepo;

        public SentenceTemplateService(SentenceTemplateRepository templateRepo)
        {
            _templateRepo = templateRepo;
        }

        public async Task<List<SentenceTemplateAdminResponse>> GetAllAsync()
        {
            var templates = await _templateRepo.GetAllAsync();
            return templates.Select(MapToAdminResponse).ToList();
        }

        public async Task<SentenceTemplateAdminResponse> GetByIdAsync(string templateId)
        {
            var template = await _templateRepo.GetByIdAsync(templateId);
            if (template == null)
                throw new NotFoundException($"Template {templateId} not found");

            return MapToAdminResponse(template);
        }

        public async Task<SentenceTemplateAdminResponse> CreateAsync(CreateSentenceTemplateRequest request)
        {
            ValidateCreateRequest(request);

            // Document ID convention: tmpl_{taskType}_{category}_{part}
            var templateId = $"tmpl_{request.TaskType}_{request.Category}_{request.Part}".ToLower();

            var template = new SentenceTemplateModel
            {
                TemplateId = templateId,
                TaskType   = request.TaskType,
                Category   = request.Category,
                Part       = request.Part,
                Templates  = request.Templates ?? new List<string>(),
                IsActive   = true
            };

            await _templateRepo.SetAsync(templateId, template);
            return MapToAdminResponse(template);
        }

        public async Task<SentenceTemplateAdminResponse> UpdateAsync(string templateId, UpdateSentenceTemplateRequest request)
        {
            var template = await _templateRepo.GetByIdAsync(templateId);
            if (template == null)
                throw new NotFoundException($"Template {templateId} not found");

            var updates = new Dictionary<string, object>();
            if (request.Templates != null) updates["Templates"] = request.Templates;
            if (request.IsActive.HasValue) updates["IsActive"]  = request.IsActive.Value;

            if (updates.Any())
                await _templateRepo.UpdateAsync(templateId, updates);

            var updated = await _templateRepo.GetByIdAsync(templateId);
            return MapToAdminResponse(updated!);
        }

        public async Task DeleteAsync(string templateId)
        {
            var template = await _templateRepo.GetByIdAsync(templateId);
            if (template == null)
                throw new NotFoundException($"Template {templateId} not found");

            // Soft delete
            await _templateRepo.UpdateAsync(templateId,
                new Dictionary<string, object> { { "IsActive", false } });
        }

        private void ValidateCreateRequest(CreateSentenceTemplateRequest r)
        {
            var errors = new List<string>();
            if (string.IsNullOrWhiteSpace(r.TaskType)) errors.Add("taskType is required");
            if (string.IsNullOrWhiteSpace(r.Category)) errors.Add("category is required");
            if (string.IsNullOrWhiteSpace(r.Part))     errors.Add("part is required");
            if (r.TaskType != "task1" && r.TaskType != "task2")
                errors.Add("taskType must be 'task1' or 'task2'");
            
            if (errors.Any()) throw new ValidationException(errors);
        }

        private SentenceTemplateAdminResponse MapToAdminResponse(SentenceTemplateModel t) =>
            new SentenceTemplateAdminResponse
            {
                TemplateId = t.TemplateId,
                TaskType   = t.TaskType,
                Category   = t.Category,
                Part       = t.Part,
                Templates  = t.Templates,
                IsActive   = t.IsActive
            };
    }
}
