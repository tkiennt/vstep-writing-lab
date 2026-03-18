using Google.Cloud.Firestore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VstepWritingLab.Data.Firebase;
using VstepWritingLab.Shared.Models;

namespace VstepWritingLab.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly FirestoreProvider _firestoreProvider;

    public AuthController(FirestoreProvider firestoreProvider)
    {
        _firestoreProvider = firestoreProvider;
    }

    /// <summary>
    /// Called by the frontend AFTER Firebase client-side registration to persist the user in Firestore.
    /// No authentication required here — Firebase UID is trusted because it comes right after signUp.
    /// </summary>
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] FirebaseRegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.FirebaseUid) ||
            string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest(ApiResponse<string>.ErrorResponse("FirebaseUid and Email are required."));
        }

        var db = _firestoreProvider.GetDb();
        var userRef = db.Collection("users").Document(request.FirebaseUid);
        var snapshot = await userRef.GetSnapshotAsync();

        if (snapshot.Exists)
        {
            // User already registered — idempotent, return 200
            return Ok(ApiResponse<string>.SuccessResponse("User already exists."));
        }

        var userData = new Dictionary<string, object>
        {
            { "email", request.Email },
            { "name", request.Name ?? "" },
            { "firebaseUid", request.FirebaseUid },
            { "role", "user" },
            { "targetLevel", "B2" },
            { "createdAt", Timestamp.GetCurrentTimestamp() },
            { "updatedAt", Timestamp.GetCurrentTimestamp() }
        };

        await userRef.SetAsync(userData);

        return Ok(ApiResponse<string>.SuccessResponse("User registered successfully."));
    }

    /// <summary>
    /// Returns the authenticated user's claims from the Firebase JWT token.
    /// </summary>
    [Authorize]
    [HttpGet("me")]
    public IActionResult GetMe()
    {
        var userId  = User.Claims.FirstOrDefault(c => c.Type == "user_id")?.Value;
        var email   = User.Claims.FirstOrDefault(c => c.Type == "email")?.Value;
        var name    = User.Claims.FirstOrDefault(c => c.Type == "name")?.Value;

        return Ok(ApiResponse<object>.SuccessResponse(new
        {
            UserId = userId,
            Email  = email,
            Name   = name
        }, "Authenticated user details retrieved."));
    }
}
