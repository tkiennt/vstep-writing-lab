using Microsoft.AspNetCore.SignalR;

namespace VstepWritingLab.API.Hubs;

/// <summary>
/// Maps the Firebase UID (sub claim) as the SignalR user identifier
/// so we can target specific users when pushing grading results.
/// </summary>
public class FirebaseUserIdProvider : IUserIdProvider
{
    public string? GetUserId(HubConnectionContext connection)
    {
        // Firebase JWT uses "user_id" claim (not the standard "sub" in some cases)
        return connection.User?.FindFirst("user_id")?.Value
            ?? connection.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
    }
}
