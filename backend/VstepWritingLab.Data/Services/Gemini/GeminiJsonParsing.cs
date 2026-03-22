using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;

namespace VstepWritingLab.Data.Services.Gemini;

/// <summary>
/// Gemini may return JSON wrapped in markdown, with preamble, or with minor schema drift (float vs int).
/// </summary>
internal static class GeminiJsonParsing
{
    /// <summary>
    /// Strips markdown fences, preamble, and returns the first balanced JSON object substring.
    /// Handles root array <c>[{ ... }]</c> when the model wraps the object.
    /// </summary>
    public static string? ExtractJsonObject(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw))
            return null;

        var s = raw.Trim();
        if (s.Length > 0 && s[0] == '\uFEFF')
            s = s[1..].TrimStart();

        // ```json ... ``` or ``` ... ```
        var fence = Regex.Match(
            s,
            @"```(?:json)?\s*([\s\S]*?)```",
            RegexOptions.IgnoreCase);
        if (fence.Success)
            s = fence.Groups[1].Value.Trim();

        s = s.Trim();
        var firstBrace = s.IndexOf('{');
        var firstBracket = s.IndexOf('[');

        if (firstBracket >= 0 && (firstBrace < 0 || firstBracket < firstBrace))
        {
            try
            {
                using var doc = JsonDocument.Parse(s[firstBracket..]);
                if (doc.RootElement.ValueKind == JsonValueKind.Array && doc.RootElement.GetArrayLength() > 0)
                {
                    var el = doc.RootElement[0];
                    if (el.ValueKind == JsonValueKind.Object)
                        return el.GetRawText();
                }
            }
            catch (JsonException)
            {
                // try object path below
            }
        }

        if (firstBrace < 0)
            return null;

        s = s[firstBrace..];
        return ExtractBalancedObject(s);
    }

    /// <summary>
    /// Returns substring containing one top-level JSON object, respecting strings and escapes.
    /// </summary>
    public static string? ExtractBalancedObject(string s)
    {
        if (string.IsNullOrEmpty(s) || s[0] != '{')
            return null;

        var depth = 0;
        var inString = false;
        var escape = false;
        for (var i = 0; i < s.Length; i++)
        {
            var c = s[i];
            if (escape)
            {
                escape = false;
                continue;
            }

            if (inString)
            {
                if (c == '\\')
                {
                    escape = true;
                    continue;
                }

                if (c == '"')
                    inString = false;
                continue;
            }

            if (c == '"')
            {
                inString = true;
                continue;
            }

            if (c == '{') depth++;
            else if (c == '}')
            {
                depth--;
                if (depth == 0)
                    return s[..(i + 1)];
            }
        }

        return null;
    }

    public static JsonSerializerOptions CreateDeserializeOptions()
    {
        var o = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            ReadCommentHandling = JsonCommentHandling.Skip,
            AllowTrailingCommas = true,
            UnmappedMemberHandling = JsonUnmappedMemberHandling.Skip,
            NumberHandling =
                JsonNumberHandling.AllowReadingFromString |
                JsonNumberHandling.AllowNamedFloatingPointLiterals,
        };
        o.Converters.Add(new FlexibleIntJsonConverter());
        o.Converters.Add(new FlexibleBoolJsonConverter());
        // Gemini often emits null for optional text fields; non-nullable string would throw.
        o.Converters.Add(new LenientStringJsonConverter());
        return o;
    }

    private sealed class FlexibleIntJsonConverter : JsonConverter<int>
    {
        public override int Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            return reader.TokenType switch
            {
                JsonTokenType.Null => 0,
                JsonTokenType.Number when reader.TryGetInt32(out var i) => i,
                JsonTokenType.Number when reader.TryGetDouble(out var d) => (int)Math.Round(d, MidpointRounding.AwayFromZero),
                JsonTokenType.String when int.TryParse(reader.GetString(), NumberStyles.Any, CultureInfo.InvariantCulture, out var si) => si,
                JsonTokenType.String when double.TryParse(reader.GetString(), NumberStyles.Any, CultureInfo.InvariantCulture, out var sd) =>
                    (int)Math.Round(sd, MidpointRounding.AwayFromZero),
                _ => throw new JsonException($"Cannot read int from {reader.TokenType}")
            };
        }

        public override void Write(Utf8JsonWriter writer, int value, JsonSerializerOptions options) =>
            writer.WriteNumberValue(value);
    }

    private sealed class FlexibleBoolJsonConverter : JsonConverter<bool>
    {
        public override bool Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            return reader.TokenType switch
            {
                JsonTokenType.Null => false,
                JsonTokenType.True => true,
                JsonTokenType.False => false,
                JsonTokenType.String => reader.GetString()?.Trim().ToLowerInvariant() switch
                {
                    "true" or "1" or "yes" => true,
                    "false" or "0" or "no" => false,
                    _ => bool.TryParse(reader.GetString(), out var b) && b
                },
                JsonTokenType.Number => reader.TryGetInt32(out var n) && n != 0,
                _ => throw new JsonException($"Cannot read bool from {reader.TokenType}")
            };
        }

        public override void Write(Utf8JsonWriter writer, bool value, JsonSerializerOptions options) =>
            writer.WriteBooleanValue(value);
    }

    /// <summary>Maps JSON null / numbers-as-text into strings so grading DTOs deserialize.</summary>
    private sealed class LenientStringJsonConverter : JsonConverter<string>
    {
        public override string Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            return reader.TokenType switch
            {
                JsonTokenType.Null => "",
                JsonTokenType.String => reader.GetString() ?? "",
                JsonTokenType.Number when reader.TryGetDouble(out var d) =>
                    d.ToString(CultureInfo.InvariantCulture),
                JsonTokenType.True => "true",
                JsonTokenType.False => "false",
                // Object/array where a string was expected — coerce to JSON text
                JsonTokenType.StartObject or JsonTokenType.StartArray =>
                    JsonSerializer.Serialize(JsonDocument.ParseValue(ref reader).RootElement),
                _ => ""
            };
        }

        public override void Write(Utf8JsonWriter writer, string value, JsonSerializerOptions options) =>
            writer.WriteStringValue(value ?? "");
    }
}
