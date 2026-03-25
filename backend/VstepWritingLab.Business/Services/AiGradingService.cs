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
using VstepWritingLab.Domain.Interfaces;
using VstepWritingLab.Domain.ValueObjects;

namespace VstepWritingLab.Business.Services
{

    public class AiGradingService : IGradingAiService
    {
        private readonly IAiClient _aiClient;
        private readonly IConfiguration _config;
        private readonly IRubricRepository _rubricRepo;
        private readonly IAiUsageLogRepository _aiLogRepo;
        private readonly ILogger<AiGradingService> _logger;

        public AiGradingService(
            IAiClient aiClient,
            IConfiguration config,
            IRubricRepository rubricRepo,
            IAiUsageLogRepository aiLogRepo,
            ILogger<AiGradingService> logger)
        {
            _aiClient      = aiClient;
            _config       = config;
            _rubricRepo   = rubricRepo;
            _aiLogRepo    = aiLogRepo;
            _logger       = logger;
        }

        public async Task<AiGradingOutput> GradeAsync(
            SubmissionModel submission,
            QuestionModel question,
            TaskModel task)
        {
            var startTime = DateTime.UtcNow;
            string modelUsed = "unknown";

            try
            {
                var rubric = await _rubricRepo.GetByTaskTypeAsync(submission.TaskType);
                if (rubric == null) throw new Exception($"Rubric not found for {submission.TaskType}");

                var systemPrompt = ConstructSystemPrompt(rubric);
                var userPrompt = ConstructUserPrompt(submission, question, task);

                // Call the unified Gemini/Vertex client
                var (jsonResult, modelUsedName) = await _aiClient.GenerateAsync(systemPrompt, userPrompt);
                modelUsed = modelUsedName;

                if (string.IsNullOrWhiteSpace(jsonResult))
                    throw new Exception("AI returned empty content");

                var startIndex = jsonResult.IndexOf('{');
                var endIndex = jsonResult.LastIndexOf('}');
                if (startIndex >= 0 && endIndex >= startIndex)
                {
                    jsonResult = jsonResult.Substring(startIndex, endIndex - startIndex + 1);
                }

                var output = JsonSerializer.Deserialize<AiGradingOutput>(jsonResult, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                if (output == null) throw new Exception("Failed to deserialize AI output");

                var latency = (int)(DateTime.UtcNow - startTime).TotalMilliseconds;
                // Dummy usage metadata since GenerateAsync returns raw text
                var usage = new GeminiUsageMetadata { TotalTokenCount = 0 }; 
                await LogUsageAsync(submission, modelUsed, usage, latency);

                return output;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AI Grading failed for submission {Id}", submission.SubmissionId);
                await LogErrorAsync(submission, modelUsed, ex.Message, (int)(DateTime.UtcNow - startTime).TotalMilliseconds);
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
    ""taskFulfilment"": 0-10 integer,
    ""organization"": 0-10 integer,
    ""vocabulary"": 0-10 integer,
    ""grammar"": 0-10 integer,
    ""overall"": 0-10 number
  },
  ""summaryEn"": ""overall feedback in English"",
  ""summaryVi"": ""tóm tắt nhận xét bằng tiếng Việt"",
  ""suggestionsEn"": [""improvement 1 in English"", ""improvement 2""],
  ""suggestionsVi"": [""gợi ý cải thiện 1 bằng tiếng Việt"", ""gợi ý 2""],
  ""annotations"": [
    { 
      ""startIndex"": number, 
      ""endIndex"": number, 
      ""type"": ""grammar|vocabulary|structure|off_topic|strength"", 
      ""messageEn"": ""description in English"",
      ""messageVi"": ""mô tả lỗi bằng tiếng Việt"",
      ""suggestionEn"": ""fix in English"",
      ""suggestionVi"": ""gợi ý sửa bằng tiếng Việt"",
      ""severity"": ""error|warning|info|good"" 
    }
  ],
  ""sentenceAnalysis"": [
    { 
      ""sentence"": ""full sentence"", 
      ""quality"": ""strong|adequate|weak"", 
      ""feedbackEn"": ""critique in English"",
      ""feedbackVi"": ""nhận xét bằng tiếng Việt"",
      ""improvedVersion"": ""better way"", 
      ""structureUsed"": ""grammar name"" 
    }
  ],
  ""suggestedStructures"": [
    { 
      ""structure"": ""name"", 
      ""example"": ""example"", 
      ""usageTipEn"": ""how to use in English"",
      ""usageTipVi"": ""cách sử dụng bằng tiếng Việt"" 
    }
  ],
  ""taskRelevance"": {
    ""isRelevant"": boolean,
    ""relevanceScore"": 0-100,
    ""verdictVi"": ""explanation in Vietnamese"",
    ""missingPointsVi"": [""point 1""],
    ""offTopicSentencesEn"": []
  }
}

LANGUAGE RULE:
You MUST provide parallel English and Vietnamese versions for all text fields as specified in the JSON keys (e.g., summaryEn AND summaryVi). 
Ensure the translations are natural and professional for both languages.
Keep 'verdictVi' and 'missingPointsVi' in Vietnamese as requested by the specific keys.

GRADING RULES:
1. Overall score is the average of the 4 criteria scores.
2. Be strict but fair according to the descriptors.
3. Identify at least 5-10 key annotations (errors or areas for improvement).
4. Provide analysis for important sentences in the essay.
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

        public Task<Result<AiGradingOutput>> GradeAsync(
            string rubricContext, string taskType, string instruction,
            string[] keyPoints, int wordCount, string essayText,
            string mode = "exam", Domain.ValueObjects.UserHistory? history = null,
            string language = "vi", CancellationToken ct = default)
        {
            return Task.FromResult(Result<AiGradingOutput>.Fail("AiGradingService (Business) GradeAsync not implemented. Use Data layer GeminiGradingService."));
        }

        public Task<Result<AiGradingOutput>> GradePhase1Async(
            string rubricContext, string taskType, string instruction,
            string[] keyPoints, int wordCount, string essayText,
            string mode = "exam", Domain.ValueObjects.UserHistory? history = null,
            string language = "vi", CancellationToken ct = default)
        {
            return Task.FromResult(Result<AiGradingOutput>.Fail("AiGradingService (Business) GradePhase1Async not implemented. Use Data layer GeminiGradingService."));
        }

        public Task<Result<AiGradingOutput>> GradePhase2Async(
            string rubricContext, string taskType, string instruction,
            string[] keyPoints, int wordCount, string essayText,
            string mode = "exam", Domain.ValueObjects.UserHistory? history = null,
            string language = "vi", CancellationToken ct = default)
        {
            return Task.FromResult(Result<AiGradingOutput>.Fail("AiGradingService (Business) GradePhase2Async not implemented. Use Data layer GeminiGradingService."));
        }

        public Task<Result<AiGradingOutput>> TranslateAnalysisAsync(AiGradingOutput source, string targetLang = "vi", CancellationToken ct = default)
        {
            return Task.FromResult(Result<AiGradingOutput>.Fail("AiGradingService (Business) Translate not implemented."));
        }
    }
}
