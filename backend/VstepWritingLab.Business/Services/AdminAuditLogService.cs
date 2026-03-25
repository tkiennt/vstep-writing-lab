using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VstepWritingLab.Business.Interfaces;
using VstepWritingLab.Shared.Models.Entities;

namespace VstepWritingLab.Business.Services
{
    public class AdminAuditLogService
    {
        private readonly IAuditLogRepository _auditRepo;

        public AdminAuditLogService(IAuditLogRepository auditRepo)
        {
            _auditRepo = auditRepo;
        }

        public async Task LogActionAsync(
            string userId, 
            string email, 
            string action, 
            string entityId, 
            string entityType,
            string status = "Success",
            string details = "", 
            string ip = "internal",
            string userAgent = "",
            string beforeData = null,
            string afterData = null,
            string errorMessage = null)
        {
            var log = new AuditLogModel
            {
                UserId = userId,
                AdminEmail = email,
                Action = action,
                EntityId = entityId,
                EntityType = entityType,
                Status = status,
                IpAddress = ip,
                UserAgent = userAgent,
                BeforeData = beforeData,
                AfterData = afterData,
                ErrorMessage = errorMessage,
                Timestamp = Google.Cloud.Firestore.Timestamp.FromDateTime(DateTime.UtcNow)
            };

            await _auditRepo.CreateAsync(log);
        }

        public async Task<List<AuditLogResponse>> GetRecentLogsAsync(int count = 100)
        {
            var logs = await _auditRepo.GetRecentAsync(count);
            return logs.Select(l => new AuditLogResponse
            {
                Id = l.Id,
                UserId = l.UserId,
                AdminEmail = l.AdminEmail,
                Action = l.Action,
                EntityId = l.EntityId,
                EntityType = l.EntityType,
                Status = l.Status,
                IpAddress = l.IpAddress,
                UserAgent = l.UserAgent,
                BeforeData = l.BeforeData,
                AfterData = l.AfterData,
                ErrorMessage = l.ErrorMessage,
                Timestamp = l.Timestamp.ToDateTime()
            }).ToList();
        }
    }

    public class AuditLogResponse
    {
        public string Id { get; set; }
        public string UserId { get; set; }
        public string AdminEmail { get; set; }
        public string Action { get; set; }
        public string EntityId { get; set; }
        public string EntityType { get; set; }
        public string Status { get; set; }
        public string IpAddress { get; set; }
        public string UserAgent { get; set; }
        public string BeforeData { get; set; }
        public string AfterData { get; set; }
        public string ErrorMessage { get; set; }
        public DateTime Timestamp { get; set; }
    }
}
