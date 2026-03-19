using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace VSTEPWritingAI.Services
{
    // ── Gemini API Request Models ───────────────────────────────────────────

    public class GeminiRequest
    {
        [JsonPropertyName("contents")]
        public List<GeminiContent> Contents { get; set; }

        [JsonPropertyName("generationConfig")]
        public GeminiGenerationConfig GenerationConfig { get; set; } = new();

        [JsonPropertyName("systemInstruction")]
        public GeminiSystemInstruction? SystemInstruction { get; set; }
    }

    public class GeminiContent
    {
        [JsonPropertyName("role")]
        public string Role { get; set; } = "user";

        [JsonPropertyName("parts")]
        public List<GeminiPart> Parts { get; set; }
    }

    public class GeminiSystemInstruction
    {
        [JsonPropertyName("parts")]
        public List<GeminiPart> Parts { get; set; }
    }

    public class GeminiPart
    {
        [JsonPropertyName("text")]
        public string Text { get; set; }
    }

    public class GeminiGenerationConfig
    {
        [JsonPropertyName("temperature")]
        public double Temperature { get; set; } = 1.0;

        [JsonPropertyName("maxOutputTokens")]
        public int MaxOutputTokens { get; set; } = 4096;

        [JsonPropertyName("topP")]
        public double TopP { get; set; } = 0.95;

        [JsonPropertyName("responseMimeType")]
        public string ResponseMimeType { get; set; } = "application/json";
    }

    // ── Gemini API Response Models ──────────────────────────────────────────

    public class GeminiResponse
    {
        [JsonPropertyName("candidates")]
        public List<GeminiCandidate> Candidates { get; set; }

        [JsonPropertyName("usageMetadata")]
        public GeminiUsageMetadata UsageMetadata { get; set; }
    }

    public class GeminiCandidate
    {
        [JsonPropertyName("content")]
        public GeminiContent Content { get; set; }

        [JsonPropertyName("finishReason")]
        public string FinishReason { get; set; }
    }

    public class GeminiUsageMetadata
    {
        [JsonPropertyName("promptTokenCount")]
        public int PromptTokenCount { get; set; }

        [JsonPropertyName("candidatesTokenCount")]
        public int CandidatesTokenCount { get; set; }

        [JsonPropertyName("totalTokenCount")]
        public int TotalTokenCount { get; set; }
    }

    // ── Structured Output from AI ───────────────────────────────────────────

    public class AiGradingOutput
    {
        public AiGradingOutputScore Score { get; set; }
        public string Summary { get; set; }
        public List<string> Suggestions { get; set; }
        public List<AiGradingOutputHighlight> Highlights { get; set; }
    }

    public class AiGradingOutputScore
    {
        public int TaskFulfilment { get; set; }
        public int Organization { get; set; }
        public int Vocabulary { get; set; }
        public int Grammar { get; set; }
        public double Overall { get; set; }
    }

    public class AiGradingOutputHighlight
    {
        public string Text { get; set; }
        public string Issue { get; set; }
        public string Type { get; set; } // "grammar" | "vocabulary" | "structure"
    }
}
