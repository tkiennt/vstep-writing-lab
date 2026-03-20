namespace VSTEPWritingAI.Models.DTOs.Requests
{
    public class SubmitEssayRequest
    {
        public string QuestionId { get; set; }
        // Must match an existing active question document

        public string Mode { get; set; }
        // "practice" | "guided"

        public string EssayContent { get; set; }
        // Full essay text written by student
    }
}
