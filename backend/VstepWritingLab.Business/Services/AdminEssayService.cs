using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VstepWritingLab.Business.Interfaces;
using VstepWritingLab.Shared.Models.Entities;
using Google.Cloud.Firestore;

namespace VstepWritingLab.Business.Services
{
    public class AdminEssayService
    {
        private readonly ISubmissionRepository _submissionRepo;
        private readonly ILegacyUserRepository _userRepo;
        private readonly IQuestionRepository _questionRepo;
        private readonly AdminAuditLogService _auditLog;
        private readonly FirestoreDb _db;

        public AdminEssayService(
            ISubmissionRepository submissionRepo, 
            ILegacyUserRepository userRepo,
            IQuestionRepository questionRepo,
            AdminAuditLogService auditLog,
            FirestoreDb db)
        {
            _submissionRepo = submissionRepo;
            _userRepo = userRepo;
            _questionRepo = questionRepo;
            _auditLog = auditLog;
            _db = db;
        }

        public async Task<List<AdminEssayResponse>> GetAllEssaysAsync()
        {
            var submissions = await _submissionRepo.GetAllAsync();
            var results = new List<AdminEssayResponse>();

            foreach (var sub in submissions)
            {
                UserModel? user = null;
                if (!string.IsNullOrEmpty(sub.UserId))
                    user = await _userRepo.GetByIdAsync(sub.UserId);

                QuestionModel? question = null;
                if (!string.IsNullOrEmpty(sub.QuestionId))
                {
                    question = await _questionRepo.GetByIdAsync(sub.QuestionId);
                    
                    // Fallback to tasks collection if not in questions
                    if (question == null)
                    {
                        var taskDoc = await _db.Collection("tasks").Document(sub.QuestionId).GetSnapshotAsync();
                        if (taskDoc.Exists)
                        {
                            var taskName = taskDoc.GetValue<string>("name");
                            question = new QuestionModel { Title = taskName, QuestionId = sub.QuestionId };
                        }
                    }
                }

                results.Add(new AdminEssayResponse
                {
                    SubmissionId = sub.SubmissionId,
                    UserId = sub.UserId,
                    UserName = user?.DisplayName ?? "Unknown User",
                    UserEmail = user?.Email ?? "N/A",
                    QuestionId = sub.QuestionId,
                    TopicTitle = question?.Title ?? "Unknown Topic",
                    TaskType = sub.TaskType,
                    Status = sub.Status,
                    OverallScore = sub.AiScore?.Overall ?? 0,
                    CreatedAt = sub.CreatedAt.ToDateTime(),
                    WordCount = sub.WordCount
                });
            }

            return results.OrderByDescending(x => x.CreatedAt).ToList();
        }

        public async Task<AdminEssayDetailResponse?> GetEssayByIdAsync(string id)
        {
            var sub = await _submissionRepo.GetByIdAsync(id);
            if (sub == null) return null;

            var user = await _userRepo.GetByIdAsync(sub.UserId);
            var question = await _questionRepo.GetByIdAsync(sub.QuestionId);
            
            // Fallback for detail view title
            string topicTitle = question?.Title ?? "Unknown Topic";
            if (question == null && !string.IsNullOrEmpty(sub.QuestionId))
            {
                var taskDoc = await _db.Collection("tasks").Document(sub.QuestionId).GetSnapshotAsync();
                if (taskDoc.Exists) topicTitle = taskDoc.GetValue<string>("name");
            }

            return new AdminEssayDetailResponse
            {
                SubmissionId = sub.SubmissionId,
                UserId = sub.UserId,
                UserName = user?.DisplayName ?? "Unknown User",
                UserEmail = user?.Email ?? "N/A",
                TopicTitle = topicTitle,
                TaskType = sub.TaskType,
                Status = sub.Status,
                EssayContent = sub.EssayContent,
                WordCount = sub.WordCount,
                OverallScore = sub.AiScore?.Overall ?? 0,
                CreatedAt = sub.CreatedAt.ToDateTime(),
                CriteriaScores = new Dictionary<string, double>
                {
                    { "Task Fulfilment", sub.AiScore?.TaskFulfilment ?? 0 },
                    { "Organization", sub.AiScore?.Organization ?? 0 },
                    { "Vocabulary", sub.AiScore?.Vocabulary ?? 0 },
                    { "Grammar", sub.AiScore?.Grammar ?? 0 }
                }
            };
        }

        public async Task UpdateEssayScoreAsync(string id, double newScore)
        {
            var submission = await _submissionRepo.GetByIdAsync(id);
            if (submission == null) throw new System.Exception("Submission not found");

            var updates = new Dictionary<string, object>();
            if (submission.AiScore != null)
            {
                updates["AiScore.Overall"] = newScore;
                updates["AiScore"] = submission.AiScore;
            }
            
            await _submissionRepo.UpdateAsync(id, updates);
            await _auditLog.LogActionAsync("admin-system", "admin@vstep.lab", "SCORE_OVERRIDDEN", id, $"Changed score to {newScore}");
        }

        public async Task DeleteEssayAsync(string id)
        {
            await _submissionRepo.DeleteAsync(id);
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
