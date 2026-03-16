using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VSTEPWritingAI.Exceptions;
using VSTEPWritingAI.Models.DTOs.Requests;
using VSTEPWritingAI.Models.DTOs.Responses;
using VSTEPWritingAI.Models.Firestore;
using VSTEPWritingAI.Repositories;

namespace VSTEPWritingAI.Services
{
    public class AdminUserService
    {
        private readonly UserRepository _userRepo;

        public AdminUserService(UserRepository userRepo)
        {
            _userRepo = userRepo;
        }

        public async Task<List<AdminUserResponse>> GetAllUsersAsync()
        {
            var users = await _userRepo.GetAllAsync();
            return users.Select(MapToResponse).ToList();
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
