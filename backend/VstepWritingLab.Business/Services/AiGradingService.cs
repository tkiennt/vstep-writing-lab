using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using VstepWritingLab.Shared.Models.Common;
using VstepWritingLab.Shared.Models.Entities;
using VstepWritingLab.Business.Interfaces;

namespace VstepWritingLab.Business.Services
{
    public class AiGradingResult
    {
        public AiGradingOutputScore Score { get; set; } = new();
        public string Summary { get; set; } = string.Empty;
        public List<string> Suggestions { get; set; } = new();
        public List<AiAnnotation> Annotations { get; set; } = new();
        public List<AiSentenceAnalysis> SentenceAnalysis { get; set; } = new();
        public List<AiSuggestedStructure> SuggestedStructures { get; set; } = new();
        public TaskRelevanceResult TaskRelevance { get; set; } = new();
    }

    public class AiGradingService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _config;
        private readonly IRubricRepository _rubricRepo;
        private readonly IAiUsageLogRepository _aiLogRepo;
        private readonly ILogger<AiGradingService> _logger;

        public AiGradingService(
            IHttpClientFactory httpClientFactory,
            IConfiguration config,
            IRubricRepository rubricRepo,
            IAiUsageLogRepository aiLogRepo,
            ILogger<AiGradingService> logger)
        {
            _httpClientFactory = httpClientFactory;
            _config            = config;
            _rubricRepo        = rubricRepo;
            _aiLogRepo         = aiLogRepo;
            _logger            = logger;
        }

        public async Task<AiGradingResult> GradeAsync(
            SubmissionModel submission,
            QuestionModel question,
            TaskModel task)
        {
            var startTime = DateTime.UtcNow;
            var apiKey = _config["Gemini:ApiKey"];
            var modelName = _config["Gemini:Model"] ?? "gemini-2.0-flash";
            var url = $"v1beta/models/{modelName}:generateContent?key={apiKey}";

            try
            {
                var rubric = await _rubricRepo.GetByTaskTypeAsync(submission.TaskType);
                if (rubric == null) throw new Exception($"Rubric not found for {submission.TaskType}");

                var systemPrompt = ConstructSystemPrompt(rubric);
                var userPrompt = ConstructUserPrompt(submission, question, task);

                var requestBody = new GeminiRequest
                {
                    SystemInstruction = new GeminiSystemInstruction
                    {
                        Parts = new List<GeminiPart> { new() { Text = systemPrompt } }
                    },
                    Contents = new List<GeminiContent>
                    {
                        new() { Parts = new List<GeminiPart> { new() { Text = userPrompt } } }
                    },
                    GenerationConfig = new GeminiGenerationConfig
                    {
                        ResponseMimeType = "application/json"
                    }
                };

                using var client = _httpClientFactory.CreateClient("GeminiClient");
                var response = await client.PostAsJsonAsync(url, requestBody);
                
                if (!response.IsSuccessStatusCode)
                {
                    var error = await response.Content.ReadAsStringAsync();
                    throw new Exception($"Gemini API error: {response.StatusCode} - {error}");
                }

                var geminiResponse = await response.Content.ReadFromJsonAsync<GeminiResponse>();
                var jsonResult = geminiResponse?.Candidates?.FirstOrDefault()?.Content?.Parts?.FirstOrDefault()?.Text;

                if (string.IsNullOrWhiteSpace(jsonResult))
                    throw new Exception("Gemini returned empty content");

                var output = JsonSerializer.Deserialize<AiGradingOutput>(jsonResult, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                if (output == null) throw new Exception("Failed to deserialize AI output");

                var result = new AiGradingResult
                {
                    Score = output.Score,
                    Summary = output.Summary,
                    Suggestions = output.Suggestions,
                    Annotations = output.Annotations,
                    SentenceAnalysis = output.SentenceAnalysis,
                    SuggestedStructures = output.SuggestedStructures,
                    TaskRelevance = output.TaskRelevance
                };

                var latency = (int)(DateTime.UtcNow - startTime).TotalMilliseconds;
                await LogUsageAsync(submission, modelName, geminiResponse.UsageMetadata, latency);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AI Grading failed for submission {Id}", submission.SubmissionId);
                await LogErrorAsync(submission, modelName, ex.Message, (int)(DateTime.UtcNow - startTime).TotalMilliseconds);
                throw;
            }
        }

        private string ConstructSystemPrompt(RubricModel rubric)
        {
            var prompt = $@"You are an expert VSTEP Writing Examiner. Your task is to grade a student's essay based on the official VSTEP Rating Scale.

RUBRIC DATA:
Name: {rubric.Name}
Criteria:
";
            foreach (var kv in rubric.Criteria)
            {
                prompt += $"- {kv.Key}: Weight={kv.Value.Weight}, Factors=[{string.Join(", ", kv.Value.SubFactors)}]\n";
                prompt += "  Bands (Level Descriptors):\n";
                foreach (var band in kv.Value.Descriptors.OrderByDescending(b => int.Parse(b.Key)))
                {
                    prompt += $"    {band.Key}: {band.Value}\n";
                }
            }

            prompt += @"
RESPONSE FORMAT:
You must return a valid JSON object strictly following this structure:
{
  ""score"": {
    ""taskFulfilment"": number,
    ""organization"": number,
    ""vocabulary"": number,
    ""grammar"": number,
    ""overall"": number
  },
  ""summary"": ""concise overall feedback"",
  ""suggestions"": [""specific improvement 1"", ""specific improvement 2""],
  ""highlights"": [
    { ""text"": ""exact text from essay"", ""issue"": ""description of error"", ""type"": ""grammar|vocabulary|structure"" }
  ]
}

GRADING RULES:
1. Overall score is the average of the 4 criteria scores.
2. Be strict but fair according to the descriptors.
3. Identify at least 3-5 key highlights (errors or areas for improvement).
";
            return prompt;
        }

        private string ConstructUserPrompt(SubmissionModel submission, QuestionModel question, TaskModel task)
        {
            return $@"QUESTION DETAILS:
Task: {task.Name} (Type: {task.Type})
Expected Level: {question.Level}
Title: {question.Title}
Instructions: {question.Instructions}
Requirements:
{string.Join("\n", question.Requirements.Select(r => "- " + r))}

STUDENT SUBMISSION:
Mode: {submission.Mode}
Word Count: {submission.WordCount}
Essay Content:
---
{submission.EssayContent}
---

Grade this essay accurately according to the VSTEP rubric.";
        }

        private async Task LogUsageAsync(SubmissionModel submission, string model, GeminiUsageMetadata usage, int latency)
        {
            var log = new AiUsageLogModel
            {
                LogId            = Guid.NewGuid().ToString("N"),
                SubmissionId     = submission.SubmissionId,
                UserId           = submission.UserId,
                Model            = model,
                PromptTokens     = usage.PromptTokenCount,
                CompletionTokens = usage.CandidatesTokenCount,
                TotalTokens      = usage.TotalTokenCount,
                LatencyMs        = latency,
                Status           = "success",
                CreatedAt        = Google.Cloud.Firestore.Timestamp.GetCurrentTimestamp()
            };
            await _aiLogRepo.CreateAsync(log);
        }

        private async Task LogErrorAsync(SubmissionModel submission, string model, string error, int latency)
        {
            var log = new AiUsageLogModel
            {
                LogId        = Guid.NewGuid().ToString("N"),
                SubmissionId = submission.SubmissionId,
                UserId       = submission.UserId,
                Model        = model,
                LatencyMs    = latency,
                Status       = "error",
                ErrorMessage = error,
                CreatedAt    = Google.Cloud.Firestore.Timestamp.GetCurrentTimestamp()
            };
            await _aiLogRepo.CreateAsync(log);
        }
    }
}
