using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FirebaseAdmin.Auth;
using VstepWritingLab.Shared.Models.DTOs.Requests;
using VstepWritingLab.Shared.Models.DTOs.Responses;
using VstepWritingLab.Shared.Models.Entities;
using VstepWritingLab.Business.Interfaces;

namespace VstepWritingLab.Business.Services
{
    public class AdminUserService
    {
        private readonly ILegacyUserRepository _userRepo;
        private readonly ISubmissionRepository _submissionRepo;
        private readonly AdminAuditLogService _auditLog;

        public AdminUserService(
            ILegacyUserRepository userRepo, 
            ISubmissionRepository submissionRepo,
            AdminAuditLogService auditLog)
        {
            _userRepo = userRepo;
            _submissionRepo = submissionRepo;
            _auditLog = auditLog;
        }

        public async Task<AdminUserResponse> CreateUserAsync(CreateUserRequest request)
        {
            // 1. Create in Firebase Auth
            var userArgs = new UserRecordArgs
            {
                Email = request.Email,
                Password = request.Password,
                DisplayName = request.DisplayName,
                Disabled = false
            };

            var userRecord = await FirebaseAuth.DefaultInstance.CreateUserAsync(userArgs);

            // 2. Set Custom Claims (Roles)
            var claims = new Dictionary<string, object> { { "role", request.Role } };
            await FirebaseAuth.DefaultInstance.SetCustomUserClaimsAsync(userRecord.Uid, claims);

            // 3. Create in Firestore
            var newUser = new UserModel
            {
                UserId = userRecord.Uid,
                Email = request.Email,
                DisplayName = request.DisplayName,
                Role = request.Role,
                IsActive = true,
                CreatedAt = Google.Cloud.Firestore.Timestamp.FromDateTime(DateTime.UtcNow),
                LastActiveAt = Google.Cloud.Firestore.Timestamp.FromDateTime(DateTime.UtcNow)
            };

            await _userRepo.SetAsync(userRecord.Uid, newUser);

            await _auditLog.LogActionAsync("admin-system", "admin@vstep.lab", "USER_CREATED", userRecord.Uid, $"Created user {request.Email} with role {request.Role}");

            return MapToResponse(newUser);
        }

        public async Task<List<AdminUserResponse>> GetAllUsersAsync()
        {
            var users = await _userRepo.GetAllAsync();
            var results = new List<AdminUserResponse>();

            foreach (var u in users)
            {
                var count = await _submissionRepo.CountByUserIdAsync(u.UserId);
                var response = MapToResponse(u);
                response.SubmissionCount = count;
                results.Add(response);
            }

            return results;
        }

        public async Task<AdminUserResponse> UpdateUserAsync(
            string userId,
            UpdateUserRequest request)
        {
            var user = await _userRepo.GetByIdAsync(userId);
            if (user == null)
                throw new Exception($"User {userId} not found");

            var updates = new Dictionary<string, object>();

            if (request.Role != null)
            {
                if (request.Role != "student" && request.Role != "admin")
                    throw new Exception("Role must be 'student' or 'admin'");
                updates["Role"] = request.Role;
            }

            if (request.IsActive.HasValue)
                updates["IsActive"] = request.IsActive.Value;

            if (updates.Any())
            {
                await _userRepo.UpdateAsync(userId, updates);
                await _auditLog.LogActionAsync("admin-system", "admin@vstep.lab", "USER_UPDATED", userId, $"Updated fields: {string.Join(", ", updates.Keys)}");
            }

            var updated = await _userRepo.GetByIdAsync(userId);
            return MapToResponse(updated!);
        }

        public async Task DeleteUserAsync(string userId)
        {
            var user = await _userRepo.GetByIdAsync(userId);
            if (user == null)
                throw new Exception($"User {userId} not found");

            await _userRepo.DeleteAsync(userId);
            await _auditLog.LogActionAsync("admin-system", "admin@vstep.lab", "USER_DELETED", userId, "Deleted user account");
        }

        private AdminUserResponse MapToResponse(UserModel u) =>
            new AdminUserResponse
            {
                UserId      = u.UserId,
                Email       = u.Email,
                DisplayName = u.DisplayName,
                Role        = u.Role,
                IsActive    = u.IsActive,
                CreatedAt   = u.CreatedAt.ToDateTime(),
                LastLoginAt = u.LastActiveAt.ToDateTime()
            };
    }
}
