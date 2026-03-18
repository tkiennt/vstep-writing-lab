using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VSTEPWritingAI.Exceptions;
using VSTEPWritingAI.Models.DTOs.Requests;
using VSTEPWritingAI.Models.DTOs.Responses;
using VSTEPWritingAI.Models.Firestore;
using VSTEPWritingAI.Repositories;
using VSTEPWritingAI.Services;

namespace VSTEPWritingAI.Services
{
    public class AdminUserService
    {
        private readonly UserRepository _userRepo;
        private readonly SubmissionService _submissionService;
        private readonly GradingService _progressService;

        public AdminUserService(
            UserRepository userRepo,
            SubmissionService submissionService,
            GradingService progressService)
        {
            _userRepo = userRepo;
            _submissionService = submissionService;
            _progressService = progressService;
        }

        public async Task<List<AdminUserResponse>> GetAllUsersAsync()
        {
            var users = await _userRepo.GetAllAsync();
            return users.Select(MapToResponse).ToList();
        }

        public async Task<AdminUserResponse> GetUserByIdAsync(string userId)
        {
            var user = await _userRepo.GetByIdAsync(userId);
            if (user == null)
                throw new NotFoundException($"User {userId} not found");

            return MapToResponse(user);
        }

        public async Task<AdminUserResponse> UpdateUserAsync(
            string userId,
            UpdateUserRequest request)
        {
            var user = await _userRepo.GetByIdAsync(userId);
            if (user == null)
                throw new NotFoundException($"User {userId} not found");

            var updates = new Dictionary<string, object>();

            if (request.Role != null)
            {
                if (request.Role != "student" && request.Role != "admin")
                    throw new ValidationException(
                        new List<string> { "Role must be 'student' or 'admin'" });
                updates["Role"] = request.Role;
            }

            if (request.IsActive.HasValue)
                updates["IsActive"] = request.IsActive.Value;

            if (updates.Any())
                await _userRepo.UpdateAsync(userId, updates);

            var updated = await _userRepo.GetByIdAsync(userId);
            return MapToResponse(updated!);
        }

        public async Task DeleteUserAsync(string userId)
        {
            var user = await _userRepo.GetByIdAsync(userId);
            if (user == null)
                throw new NotFoundException($"User {userId} not found");

            await _userRepo.DeleteAsync(userId);
        }

        public async Task<List<SubmissionListItemResponse>> GetUserSubmissionsAsync(
            string userId, string? status = null, int limit = 20)
        {
            // Reusing SubmissionService's logic but for admin access (no ownership check)
            return await _submissionService.GetHistoryAsync(userId, limit);
        }

        public async Task<ProgressResponse> GetUserProgressAsync(string userId)
        {
            return await _progressService.GetByUserIdAsync(userId);
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
                LastLoginAt = u.LastLoginAt.ToDateTime()
            };
    }
}
