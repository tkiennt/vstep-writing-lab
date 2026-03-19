using FirebaseAdmin.Auth;
using Google.Cloud.Firestore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using VSTEPWritingAI.Exceptions;
using VSTEPWritingAI.Models.Firestore;
using VSTEPWritingAI.Repositories;

namespace VSTEPWritingAI.Services
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

        // Called after Firebase Auth registration on the frontend.
        // Frontend sends the Firebase ID token; backend creates the Firestore
        // user document if it doesn't already exist.

        public async Task<UserModel> RegisterAsync(
            string firebaseToken,
            string displayName)
        {
            // Verify token and extract UID + email
            FirebaseToken decoded;
            try
            {
                decoded = await FirebaseAuth.DefaultInstance
                    .VerifyIdTokenAsync(firebaseToken);
            }
            catch (FirebaseAuthException ex)
            {
                throw new UnauthorizedException($"Invalid token: {ex.Message}");
            }

            var uid   = decoded.Uid;
            var email = decoded.Claims.GetValueOrDefault("email")?.ToString() ?? "";

            // Idempotent — if user doc already exists, return it as-is
            var existing = await _userRepo.GetByIdAsync(uid);
            if (existing != null)
                return existing;

            var user = new UserModel
            {
                UserId      = uid,
                Email       = email,
                DisplayName = displayName,
                Role        = "student",   // all new registrations are students
                IsActive    = true,
                CreatedAt   = Timestamp.GetCurrentTimestamp(),
                LastLoginAt = Timestamp.GetCurrentTimestamp()
            };

            await _userRepo.SetAsync(uid, user);
            _logger.LogInformation("New user registered: {Uid} ({Email})", uid, email);

            return user;
        }

        // Returns the current user's Firestore document.
        // UID is extracted from the validated JWT claims set by middleware.

        public async Task<UserModel?> GetCurrentUserAsync(string uid)
        {
            if (string.IsNullOrEmpty(uid)) return null;
            return await _userRepo.GetByIdAsync(uid);
        }
    }
}
