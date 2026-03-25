
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using VstepWritingLab.Shared.Models.DTOs.Requests;
using VstepWritingLab.Shared.Models.DTOs.Responses;
using VstepWritingLab.Shared.Models.Entities;
using VstepWritingLab.Business.Interfaces;

namespace VstepWritingLab.Business.Services
{
    public interface IUserService
    {
        Task<UserProfileResponse?> GetProfileAsync(string userId);
        Task<UserProfileResponse> UpdateProfileAsync(string userId, UpdateProfileRequest request);
    }

    public class UserService : IUserService
    {
        private readonly ILegacyUserRepository _userRepo;

        public UserService(ILegacyUserRepository userRepo)
        {
            _userRepo = userRepo;
        }

        public async Task<UserProfileResponse?> GetProfileAsync(string userId)
        {
            var user = await _userRepo.GetByIdAsync(userId);
            if (user == null) return null;

            return MapToResponse(user);
        }

        public async Task<UserProfileResponse> UpdateProfileAsync(string userId, UpdateProfileRequest request)
        {
            var user = await _userRepo.GetByIdAsync(userId);
            if (user == null)
                throw new Exception($"User {userId} not found");

            var updates = new Dictionary<string, object>();

            if (!string.IsNullOrEmpty(request.DisplayName))
                updates["DisplayName"] = request.DisplayName;
            
            // Allow combining FirstName/LastName into DisplayName if they come separately
            if (!string.IsNullOrEmpty(request.FirstName) || !string.IsNullOrEmpty(request.LastName))
            {
                var first = request.FirstName ?? "";
                var last = request.LastName ?? "";
                updates["DisplayName"] = $"{first} {last}".Trim();
            }

            if (request.AvatarUrl != null)
                updates["AvatarUrl"] = request.AvatarUrl;

            if (request.TargetLevel != null)
                updates["TargetLevel"] = request.TargetLevel;

            if (request.EmailNotificationsEnabled != null)
                updates["EmailNotificationsEnabled"] = request.EmailNotificationsEnabled;

            if (request.WebNotificationsEnabled != null)
                updates["WebNotificationsEnabled"] = request.WebNotificationsEnabled;

            if (updates.Count > 0)
            {
                await _userRepo.UpdateAsync(userId, updates);
            }

            var updated = await _userRepo.GetByIdAsync(userId);
            return MapToResponse(updated!);
        }

        private UserProfileResponse MapToResponse(UserModel u) =>
            new UserProfileResponse
            {
                UserId = u.UserId,
                Email = u.Email,
                DisplayName = u.DisplayName,
                AvatarUrl = u.AvatarUrl,
                Role = u.Role,
                CurrentLevel = u.CurrentLevel,
                TargetLevel = u.TargetLevel,
                EmailNotificationsEnabled = u.EmailNotificationsEnabled,
                WebNotificationsEnabled = u.WebNotificationsEnabled,
                CreatedAt = u.CreatedAt.ToDateTime(),
                LastActiveAt = u.LastActiveAt.ToDateTime()
            };
    }
}
