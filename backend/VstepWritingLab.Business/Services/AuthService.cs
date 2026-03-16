using FirebaseAdmin.Auth;
using Google.Cloud.Firestore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using VstepWritingLab.Shared.Models.Entities;
using VstepWritingLab.Data.Repositories;

namespace VstepWritingLab.Business.Services
{
    public class AuthService
    {
        private readonly UserRepository _userRepo;
        private readonly ILogger<AuthService> _logger;

        public AuthService(
            UserRepository userRepo,
            ILogger<AuthService> logger)
        {
            _userRepo = userRepo;
            _logger   = logger;
        }

        public async Task<UserModel> RegisterAsync(
            string firebaseToken,
            string displayName)
        {
            FirebaseToken decoded;
            try
            {
                decoded = await FirebaseAuth.DefaultInstance
                    .VerifyIdTokenAsync(firebaseToken);
            }
            catch (FirebaseAuthException ex)
            {
                // Note: Exceptions should be moved to Shared or API as well, 
                // but for now I'll just use the standard Exception if I haven't moved them yet.
                // Assuming they will be in VstepWritingLab.API or Shared.
                throw new Exception($"Invalid token: {ex.Message}");
            }

            var uid   = decoded.Uid;
            var email = decoded.Claims.GetValueOrDefault("email")?.ToString() ?? "";

            var existing = await _userRepo.GetByIdAsync(uid);
            if (existing != null)
                return existing;

            var user = new UserModel
            {
                UserId      = uid,
                Email       = email,
                DisplayName = displayName,
                Role        = "student",
                IsActive    = true,
                CreatedAt   = Timestamp.GetCurrentTimestamp(),
                LastLoginAt = Timestamp.GetCurrentTimestamp()
            };

            await _userRepo.SetAsync(uid, user);
            _logger.LogInformation("New user registered: {Uid} ({Email})", uid, email);

            return user;
        }

        public async Task<UserModel?> GetCurrentUserAsync(string uid)
        {
            if (string.IsNullOrEmpty(uid)) return null;
            return await _userRepo.GetByIdAsync(uid);
        }
    }
}
