using Microsoft.AspNetCore.Mvc;
using VSTEPWritingAI.Exceptions;

namespace VSTEPWritingAI.Helpers
{
    public static class ControllerExtensions
    {
        public static string GetUserId(this ControllerBase controller)
        {
            var uid = controller.User.FindFirst("uid")?.Value;
            if (string.IsNullOrEmpty(uid))
                throw new UnauthorizedException("User not authenticated");
            return uid;
        }

        public static string GetUserRole(this ControllerBase controller)
        {
            return controller.User.FindFirst("role")?.Value ?? "student";
        }
    }
}
