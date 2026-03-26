using System.Text;

namespace VstepWritingLab.Data.Services.Gemini;

public static class JsonRepairHelper
{
    public static string RepairTruncatedJson(string json)
    {
        if (string.IsNullOrWhiteSpace(json)) return "{}";

        // Find the first and last brackets
        int firstBrace = json.IndexOf('{');
        int firstBracket = json.IndexOf('[');
        int start = -1;

        if (firstBrace >= 0 && (firstBracket < 0 || firstBrace < firstBracket))
            start = firstBrace;
        else if (firstBracket >= 0)
            start = firstBracket;

        if (start == -1) return "{}";

        // Cut off everything before the first bracket
        json = json.Substring(start);

        // Count balanced brackets
        Stack<char> stack = new Stack<char>();
        bool inString = false;
        bool escaped = false;

        for (int i = 0; i < json.Length; i++)
        {
            char c = json[i];

            if (escaped)
            {
                escaped = false;
                continue;
            }

            if (c == '\\')
            {
                escaped = true;
                continue;
            }

            if (c == '"')
            {
                inString = !inString;
                continue;
            }

            if (!inString)
            {
                if (c == '{' || c == '[')
                {
                    stack.Push(c);
                }
                else if (c == '}' || c == ']')
                {
                    if (stack.Count > 0)
                    {
                        char open = stack.Peek();
                        if ((c == '}' && open == '{') || (c == ']' && open == '['))
                        {
                            stack.Pop();
                        }
                    }
                }
            }
        }

        StringBuilder sb = new StringBuilder(json);

        // If we are left inside a string, close it
        if (inString)
        {
            sb.Append('"');
        }

        // Close all remaining brackets in reverse order
        while (stack.Count > 0)
        {
            char open = stack.Pop();
            if (open == '{')
            {
                // We might be mid-key or mid-value. 
                // A very crude fix is to just close it, but let's try to handle trailing commas
                string current = sb.ToString().TrimEnd();
                if (current.EndsWith(','))
                {
                    sb.Length = current.Length - 1;
                }
                sb.Append('}');
            }
            else if (open == '[')
            {
                string current = sb.ToString().TrimEnd();
                if (current.EndsWith(','))
                {
                    sb.Length = current.Length - 1;
                }
                sb.Append(']');
            }
        }

        return sb.ToString();
    }
}
