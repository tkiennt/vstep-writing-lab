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

        public async Task<AiGradingResult> GradeAsync(
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

                var systemPrompt = ConstructSystemPrompt(rubric, submission.Language ?? "vi");
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
                // Dummy usage metadata since GenerateAsync returns raw text
                var usage = new GeminiUsageMetadata { TotalTokenCount = 0 }; 
                await LogUsageAsync(submission, modelUsed, usage, latency);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AI Grading failed for submission {Id}", submission.SubmissionId);
                await LogErrorAsync(submission, modelUsed, ex.Message, (int)(DateTime.UtcNow - startTime).TotalMilliseconds);
                throw;
            }
        }

        private string ConstructSystemPrompt(RubricModel rubric, string language)
        {
            var targetLang = language == "en" ? "English" : "Vietnamese";
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
  ""summary"": ""concise overall feedback"",
  ""suggestions"": [""specific improvement 1"", ""specific improvement 2""],
  ""annotations"": [
    { ""startIndex"": number, ""endIndex"": number, ""type"": ""grammar|vocabulary|structure|off_topic|strength"", ""message"": ""error description"", ""suggestion"": ""suggested correction"", ""severity"": ""error|warning|info|good"" }
  ],
  ""sentenceAnalysis"": [
    { ""sentence"": ""full sentence"", ""quality"": ""strong|adequate|weak"", ""feedbackVi"": ""critique of this specific sentence"", ""improvedVersion"": ""better way to write it"", ""structureUsed"": ""name of grammar structure"" }
  ],
  ""suggestedStructures"": [
    { ""structure"": ""name"", ""example"": ""example sentence"", ""usageTip"": ""how to use it"" }
  ],
  ""taskRelevance"": {
    ""isRelevant"": boolean,
    ""relevanceScore"": 0-100,
    ""verdictVi"": ""explanation of relevance"",
    ""missingPointsVi"": [""point 1"", ""point 2""],
    ""offTopicSentencesEn"": []
  }
}

LANGUAGE RULE:
You MUST provide all natural language fields (summary, suggestions, annotations.message, annotations.suggestion, sentenceAnalysis.feedbackVi, sentenceAnalysis.improvedVersion, suggestedStructures.structure, suggestedStructures.example, suggestedStructures.usageTip, taskRelevance.verdictVi, taskRelevance.missingPointsVi) strictly in " + targetLang + @". 
Do NOT use any other language for these fields. 
The names like 'feedbackVi' and 'verdictVi' must still be used in JSON keys, but their values must be in " + targetLang + @".

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
    }
}
