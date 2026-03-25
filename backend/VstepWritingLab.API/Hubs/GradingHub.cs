using Microsoft.AspNetCore.SignalR;

namespace VstepWritingLab.API.Hubs;

/// <summary>
/// SignalR Hub for real-time grading notifications.
/// Clients join a group named by their userId to receive only their results.
/// </summary>
public class GradingHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        // The userId is read from the Firebase JWT claims
        var userId = Context.UserIdentifier;
        if (!string.IsNullOrEmpty(userId))
        {
            // Add this connection to a group named after the user
            await Groups.AddToGroupAsync(Context.ConnectionId, userId);
        }
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.UserIdentifier;
        if (!string.IsNullOrEmpty(userId))
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, userId);
        }
        await base.OnDisconnectedAsync(exception);
    }
}
