using System.Threading.Tasks;
using VSTEPWritingAI.Models.Firestore;
using VSTEPWritingAI.Models.Common;

namespace VSTEPWritingAI.Services
{
    public class AiGradingResult
    {
        public AiScoreModel Score { get; set; }
        public AiFeedbackModel Feedback { get; set; }
    }

    public class AiGradingService
    {
        public async Task<AiGradingResult> GradeAsync(
            SubmissionModel submission,
            QuestionModel question,
            TaskModel task)
        {
            // Placeholder implementation for Part 3
            await Task.Delay(1000);
            return new AiGradingResult
            {
                Score = new AiScoreModel
                {
                    TaskFulfilment = 5,
                    Organization = 5,
                    Vocabulary = 5,
                    Grammar = 5,
                    Overall = 5.0
                },
                Feedback = new AiFeedbackModel
                {
                    Summary = "AI Grading Placeholder",
                    Suggestions = new () { "Keep writing!" },
                    Highlights = new ()
                }
            };
        }
    }
}
