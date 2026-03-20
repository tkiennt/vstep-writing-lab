using FirebaseAdmin.Auth;
using Google.Cloud.Firestore;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System.Security.Claims;

namespace VstepWritingLab.API.Middleware;

public class FirebaseAuthMiddleware(
    RequestDelegate next,
    ILogger<FirebaseAuthMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context, FirestoreDb db)
    {
        var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();

        if (authHeader != null && authHeader.StartsWith("Bearer "))
        {
            var token = authHeader.Substring("Bearer ".Length).Trim();

            try
            {
                var decodedToken = await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(token);
                var uid = decodedToken.Uid;

                var userDoc = await db.Collection("users").Document(uid).GetSnapshotAsync();

                var role = "student"; 
                var isActive = true;

                if (userDoc.Exists)
                {
                    if (userDoc.TryGetValue<string>("Role", out var r1)) role = r1;
                    else if (userDoc.TryGetValue<string>("role", out var r2)) role = r2;

                    if (userDoc.TryGetValue<bool>("IsActive", out var ia1)) isActive = ia1;
                    else if (userDoc.TryGetValue<bool>("isActive", out var ia2)) isActive = ia2;
                }

                if (!isActive)
                {
                    context.Response.StatusCode = 403;
                    await context.Response.WriteAsJsonAsync(new { message = "Account has been deactivated" });
                    return;
                }

                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.NameIdentifier, uid),
                    new Claim(ClaimTypes.Email, decodedToken.Claims.GetValueOrDefault("email")?.ToString() ?? ""),
                    new Claim(ClaimTypes.Role, role),
                    new Claim("uid", uid),
                    new Claim("role", role)
                };

                var identity = new ClaimsIdentity(claims, "Firebase");
                context.User = new ClaimsPrincipal(identity);

                _ = db.Collection("users").Document(uid).UpdateAsync("LastActiveAt", Google.Cloud.Firestore.Timestamp.GetCurrentTimestamp());
            }
            catch (FirebaseAuthException ex)
            {
                logger.LogWarning("Invalid Firebase token: {Message}", ex.Message);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Unexpected error in auth middleware");
            }
        }

        await next(context);
    }
}
