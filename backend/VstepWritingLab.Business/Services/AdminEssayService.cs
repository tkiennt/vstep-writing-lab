using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VstepWritingLab.Business.Interfaces;
using VstepWritingLab.Shared.Models.Entities;
using Google.Cloud.Firestore;
using VstepWritingLab.Domain.Interfaces;

namespace VstepWritingLab.Business.Services
{
    public class AdminEssayService
    {
        private readonly IGradingResultRepository _gradingResultRepo;
        private readonly ILegacyUserRepository _userRepo;
        private readonly IExamPromptRepository _examPromptRepo;
        private readonly AdminAuditLogService _auditLog;
        private readonly FirestoreDb _db;

        public AdminEssayService(
            IGradingResultRepository gradingResultRepo, 
            ILegacyUserRepository userRepo,
            IExamPromptRepository examPromptRepo,
            AdminAuditLogService auditLog,
            FirestoreDb db)
        {
            _gradingResultRepo = gradingResultRepo;
            _userRepo = userRepo;
            _examPromptRepo = examPromptRepo;
            _auditLog = auditLog;
            _db = db;
        }

        public async Task<List<AdminEssayResponse>> GetAllEssaysAsync()
        {
            var submissions = await _gradingResultRepo.GetAllAsync(500); // Admin can view up to 500 records
            var results = new List<AdminEssayResponse>();

            foreach (var sub in submissions)
            {
                UserModel? user = null;
                if (!string.IsNullOrEmpty(sub.StudentId))
                    user = await _userRepo.GetByIdAsync(sub.StudentId);

                Domain.Entities.ExamPrompt? prompt = null;
                if (!string.IsNullOrEmpty(sub.ExamId))
                {
                    prompt = await _examPromptRepo.GetByIdAsync(sub.ExamId);
                }

                // Make sure to normalize status string from domain layer ('Completed' -> 'completed')
                string normalizedStatus = sub.Status?.ToLower() ?? "pending";
                if (normalizedStatus == "completed") normalizedStatus = "scored";

                results.Add(new AdminEssayResponse
                {
                    SubmissionId = sub.Id,
                    UserId = sub.StudentId,
                    UserName = user?.DisplayName ?? "Unknown User",
                    UserEmail = user?.Email ?? "N/A",
                    QuestionId = sub.ExamId,
                    TopicTitle = !string.IsNullOrEmpty(prompt?.TopicKeyword) ? prompt.TopicKeyword : prompt?.Instruction ?? "Unknown Topic",
                    TaskType = sub.TaskType,
                    Status = normalizedStatus,
                    OverallScore = sub.TotalScore,
                    CreatedAt = sub.GradedAt,
                    WordCount = sub.WordCount
                });
            }

            return results.OrderByDescending(x => x.CreatedAt).ToList();
        }

        public async Task<AdminEssayDetailResponse?> GetEssayByIdAsync(string id)
        {
            var sub = await _gradingResultRepo.GetByIdAsync(id);
            if (sub == null) return null;

            var user = await _userRepo.GetByIdAsync(sub.StudentId);
            var prompt = await _examPromptRepo.GetByIdAsync(sub.ExamId);
            
            string topicTitle = !string.IsNullOrEmpty(prompt?.TopicKeyword) ? prompt.TopicKeyword : prompt?.Instruction ?? "Unknown Topic";

            string normalizedStatus = sub.Status?.ToLower() ?? "pending";
            if (normalizedStatus == "completed") normalizedStatus = "scored";

            return new AdminEssayDetailResponse
            {
                SubmissionId = sub.Id,
                UserId = sub.StudentId,
                UserName = user?.DisplayName ?? "Unknown User",
                UserEmail = user?.Email ?? "N/A",
                TopicTitle = topicTitle,
                TaskType = sub.TaskType,
                Status = normalizedStatus,
                EssayContent = sub.EssayText,
                WordCount = sub.WordCount,
                OverallScore = sub.TotalScore,
                CreatedAt = sub.GradedAt,
                CriteriaScores = new Dictionary<string, double>
                {
                    { "Task Fulfilment", sub.TaskFulfilment?.Score ?? 0 },
                    { "Organization", sub.Organization?.Score ?? 0 },
                    { "Vocabulary", sub.Vocabulary?.Score ?? 0 },
                    { "Grammar", sub.Grammar?.Score ?? 0 }
                }
            };
        }

        public async Task UpdateEssayScoreAsync(string id, double newScore)
        {
            var submission = await _gradingResultRepo.GetByIdAsync(id);
            if (submission == null) throw new System.Exception("Submission not found");
            
            await _gradingResultRepo.UpdateScoreAsync(id, newScore);
            await _auditLog.LogActionAsync("admin-system", "admin@vstep.lab", "SCORE_OVERRIDDEN", id, $"Changed score to {newScore}");
        }

        public async Task DeleteEssayAsync(string id)
        {
            await _gradingResultRepo.DeleteAsync(id);
            await _auditLog.LogActionAsync("admin-system", "admin@vstep.lab", "ESSAY_DELETED", id, "Deleted submission record");
        }
    }

    public class AdminEssayResponse
    {
        public string SubmissionId { get; set; }
        public string UserId { get; set; }
        public string UserName { get; set; }
        public string UserEmail { get; set; }
        public string QuestionId { get; set; }
        public string TopicTitle { get; set; }
        public string TaskType { get; set; }
        public string Status { get; set; }
        public double OverallScore { get; set; }
        public System.DateTime CreatedAt { get; set; }
        public int WordCount { get; set; }
    }

    public class AdminEssayDetailResponse : AdminEssayResponse
    {
        public string EssayContent { get; set; }
        public Dictionary<string, double> CriteriaScores { get; set; } = new();
    }
}
