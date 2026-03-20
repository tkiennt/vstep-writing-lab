using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using VstepWritingLab.Business.Interfaces;

namespace VstepWritingLab.Business.Services
{
    public class OutlineService : IOutlineService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _config;

        public OutlineService(IHttpClientFactory httpClientFactory, IConfiguration config)
        {
            _httpClientFactory = httpClientFactory;
            _config = config;
        }

        public async Task<List<OutlineStepDto>> GenerateOutlineAsync(string instruction, string taskType)
        {
            var apiKey = _config["Gemini:ApiKey"];
            var modelName = "gemini-2.5-flash"; // Use Flash for outline
            var url = $"v1beta/models/{modelName}:generateContent?key={apiKey}";

            var systemPrompt = $@"You are an AI assistant helping a student plan a VSTEP Writing {taskType} essay.
Based on the instruction, provide a 4-5 step outline. Each step should have a Title and a helpful Hint for the student.
Respond ONLY with a JSON array of objects: [{{ ""index"": 1, ""title"": ""..."", ""hint"": ""..."" }}]";

            var requestBody = new GeminiRequest
            {
                SystemInstruction = new GeminiSystemInstruction
                {
                    Parts = new List<GeminiPart> { new() { Text = systemPrompt } }
                },
                Contents = new List<GeminiContent>
                {
                    new() { Parts = new List<GeminiPart> { new() { Text = $"Instruction: {instruction}" } } }
                },
                GenerationConfig = new GeminiGenerationConfig { ResponseMimeType = "application/json" }
            };

            using var client = _httpClientFactory.CreateClient("GeminiClient");
            var response = await client.PostAsJsonAsync(url, requestBody);
            
            if (!response.IsSuccessStatusCode) return GetDefaultOutline(taskType);

            var geminiResponse = await response.Content.ReadFromJsonAsync<GeminiResponse>();
            var jsonResult = geminiResponse?.Candidates?.FirstOrDefault()?.Content?.Parts?.FirstOrDefault()?.Text;

            if (string.IsNullOrWhiteSpace(jsonResult)) return GetDefaultOutline(taskType);

            var startIndex = jsonResult.IndexOf('[');
            var endIndex = jsonResult.LastIndexOf(']');
            if (startIndex >= 0 && endIndex >= startIndex)
            {
                jsonResult = jsonResult.Substring(startIndex, endIndex - startIndex + 1);
            }

            try {
                return JsonSerializer.Deserialize<List<OutlineStepDto>>(jsonResult, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? GetDefaultOutline(taskType);
            } catch {
                return GetDefaultOutline(taskType);
            }
        }

        private List<OutlineStepDto> GetDefaultOutline(string taskType)
        {
            if (taskType == "task1")
            {
                return new List<OutlineStepDto> {
                    new() { Index = 1, Title = "Salutation", Hint = "Dear Mr./Ms. [Last Name] or Dear [First Name]" },
                    new() { Index = 2, Title = "Opening", Hint = "Explain the purpose of your letter/email." },
                    new() { Index = 3, Title = "Body Details", Hint = "Address all bullet points from the instruction." },
                    new() { Index = 4, Title = "Closing", Hint = "Request a reply or express hope for future contact." },
                    new() { Index = 5, Title = "Sign-off", Hint = "Yours sincerely / Yours faithfully / Best regards." }
                };
            }
            return new List<OutlineStepDto> {
                new() { Index = 1, Title = "Introduction", Hint = "Paraphrase the topic and state your position." },
                new() { Index = 2, Title = "Body Paragraph 1", Hint = "Present your first main argument with supporting examples." },
                new() { Index = 3, Title = "Body Paragraph 2", Hint = "Present your second main argument or counter-argument." },
                new() { Index = 4, Title = "Conclusion", Hint = "Summarize your points and restate your final opinion." }
            };
        }
    }
}
