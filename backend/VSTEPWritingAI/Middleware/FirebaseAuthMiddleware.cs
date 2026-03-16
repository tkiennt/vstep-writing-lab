using FirebaseAdmin.Auth;
using Google.Cloud.Firestore;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace VSTEPWritingAI.Middleware
{
    public class FirebaseAuthMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<FirebaseAuthMiddleware> _logger;

        public FirebaseAuthMiddleware(
            RequestDelegate next,
            ILogger<FirebaseAuthMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context, FirestoreDb db)
        {
            var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();

            if (authHeader != null && authHeader.StartsWith("Bearer "))
            {
                var token = authHeader.Substring("Bearer ".Length).Trim();

                try
                {
                    // Verify token with Firebase Admin SDK
                    var decodedToken = await FirebaseAuth.DefaultInstance
                        .VerifyIdTokenAsync(token);

                    var uid = decodedToken.Uid;

                    // Read user role from Firestore
                    var userDoc = await db.Collection("users")
                        .Document(uid)
                        .GetSnapshotAsync();

                    var role = "student"; // default role
                    var isActive = true;

                    if (userDoc.Exists)
                    {
                        role     = userDoc.GetValue<string>("Role") ?? "student";
                        isActive = userDoc.GetValue<bool>("IsActive");
                    }

                    // Block deactivated users
                    if (!isActive)
                    {
                        context.Response.StatusCode = 403;
                        await context.Response.WriteAsJsonAsync(new
                        {
                            message = "Account has been deactivated"
                        });
                        return;
                    }

                    // Build ClaimsPrincipal so [Authorize] attributes work normally
                    var claims = new List<Claim>
                    {
                        new Claim(ClaimTypes.NameIdentifier, uid),
                        new Claim(ClaimTypes.Email,
                            decodedToken.Claims.GetValueOrDefault("email")
                                ?.ToString() ?? ""),
                        new Claim(ClaimTypes.Role, role),
                        new Claim("uid", uid),
                        new Claim("role", role)
                    };

                    var identity  = new ClaimsIdentity(claims, "Firebase");
                    var principal = new ClaimsPrincipal(identity);
                    context.User  = principal;

                    // Update lastLoginAt in Firestore (fire and forget)
                    _ = db.Collection("users").Document(uid).UpdateAsync(
                        "LastLoginAt", Timestamp.GetCurrentTimestamp());
                }
                catch (FirebaseAuthException ex)
                {
                    _logger.LogWarning("Invalid Firebase token: {Message}", ex.Message);
                    // Do not short-circuit — let [Authorize] handle the 401
                    // This allows anonymous endpoints to still work
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Unexpected error in auth middleware");
                }
            }

            await _next(context);
        }
    }
}
