using FirebaseAdmin.Auth;
using Google.Cloud.Firestore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using VstepWritingLab.Shared.Models.Entities;
using VstepWritingLab.Business.Interfaces;

namespace VstepWritingLab.Business.Services
{
    public class AuthService
    {
        private readonly ILegacyUserRepository _userRepo;
        private readonly ILogger<AuthService> _logger;

        public AuthService(
            ILegacyUserRepository userRepo,
            ILogger<AuthService> logger)
        {
            _userRepo = userRepo;
            _logger   = logger;
        }

        public async Task<(UserModel User, bool IsNew)> SyncUserAsync(string firebaseToken)
        {
            FirebaseToken decoded;
            try
            {
                decoded = await FirebaseAuth.DefaultInstance
                    .VerifyIdTokenAsync(firebaseToken);
            }
            catch (FirebaseAuthException ex)
            {
                _logger.LogError(ex, "Firebase token verification failed");
                throw new Exception($"Invalid token: {ex.Message}");
            }

            var uid   = decoded.Uid;
            var email = decoded.Claims.GetValueOrDefault("email")?.ToString() ?? "";
            var name  = decoded.Claims.GetValueOrDefault("name")?.ToString() ?? "";
            var picture = decoded.Claims.GetValueOrDefault("picture")?.ToString() ?? "";

            var existing = await _userRepo.GetByIdAsync(uid);
            if (existing != null)
            {
                existing.LastActiveAt = Timestamp.GetCurrentTimestamp();
                await _userRepo.UpdateAsync(uid, new Dictionary<string, object>
                {
                    { "LastActiveAt", existing.LastActiveAt }
                });
                return (existing, false);
            }

            var user = new UserModel
            {
                UserId      = uid,
                Email       = email,
                DisplayName = string.IsNullOrWhiteSpace(name) ? email.Split('@')[0] : name,
                AvatarUrl   = picture,
                Role        = "student",
                IsActive    = true,
                OnboardingCompleted = false,
                CreatedAt   = Timestamp.GetCurrentTimestamp(),
                LastActiveAt = Timestamp.GetCurrentTimestamp()
            };

            await _userRepo.SetAsync(uid, user);
            _logger.LogInformation("New user synced: {Uid} ({Email})", uid, email);

            return (user, true);
        }

        public async Task UpdateOnboardingAsync(string uid, string displayName, string currentLevel, string targetLevel)
        {
            var updates = new Dictionary<string, object>
            {
                { "DisplayName", displayName },
                { "CurrentLevel", currentLevel },
                { "TargetLevel", targetLevel },
                { "OnboardingCompleted", true },
                { "LastActiveAt", Timestamp.GetCurrentTimestamp() }
            };

            await _userRepo.UpdateAsync(uid, updates);
            _logger.LogInformation("User {Uid} completed onboarding", uid);
        }

        public async Task<UserModel?> GetCurrentUserAsync(string uid)
        {
            if (string.IsNullOrEmpty(uid)) return null;
            return await _userRepo.GetByIdAsync(uid);
        }
    }
}
