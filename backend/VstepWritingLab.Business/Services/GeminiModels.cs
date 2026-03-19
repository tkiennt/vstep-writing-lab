using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace VstepWritingLab.Business.Services
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
        public AiGradingOutputScore Score { get; set; } = new();
        public string Summary { get; set; } = string.Empty;
        public List<string> Suggestions { get; set; } = new();
        public List<AiAnnotation> Annotations { get; set; } = new();
        public List<AiSentenceAnalysis> SentenceAnalysis { get; set; } = new();
        public List<AiSuggestedStructure> SuggestedStructures { get; set; } = new();
        public TaskRelevanceResult TaskRelevance { get; set; } = new();
    }

    public class AiGradingOutputScore
    {
        public int TaskFulfilment { get; set; }
        public int Organization { get; set; }
        public int Vocabulary { get; set; }
        public int Grammar { get; set; }
        public double Overall { get; set; }
    }

    public class AiAnnotation
    {
        public int StartIndex { get; set; }
        public int EndIndex { get; set; }
        public string Type { get; set; } = string.Empty; // "grammar"|"vocab_weak"|"vocab_repeat"|"off_topic"|"strength"
        public string Message { get; set; } = string.Empty;
        public string? Suggestion { get; set; }
        public string Severity { get; set; } = "info"; // "error"|"warning"|"info"|"good"
    }

    public class AiSentenceAnalysis
    {
        public string Sentence { get; set; } = string.Empty;
        public string Quality { get; set; } = "adequate"; // "strong"|"adequate"|"weak"
        public string FeedbackVi { get; set; } = string.Empty;
        public string? ImprovedVersion { get; set; }
        public string StructureUsed { get; set; } = string.Empty;
    }

    public class AiSuggestedStructure
    {
        public string Structure { get; set; } = string.Empty;
        public string Example { get; set; } = string.Empty;
        public string UsageTip { get; set; } = string.Empty;
    }

    public class TaskRelevanceResult
    {
        public bool IsRelevant { get; set; }
        public int RelevanceScore { get; set; }
        public string VerdictVi { get; set; } = string.Empty;
        public List<string> MissingPointsVi { get; set; } = new();
        public List<string> OffTopicSentencesEn { get; set; } = new();
    }
}
