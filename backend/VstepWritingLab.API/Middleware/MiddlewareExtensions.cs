using Microsoft.AspNetCore.Builder;

namespace VstepWritingLab.API.Middleware
{
    public static class MiddlewareExtensions
    {
        public static IApplicationBuilder UseFirebaseAuth(
            this IApplicationBuilder app)
        {
            return app.UseMiddleware<FirebaseAuthMiddleware>();
        }
    }
}
