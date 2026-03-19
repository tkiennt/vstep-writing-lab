using Microsoft.AspNetCore.Builder;

namespace VSTEPWritingAI.Middleware
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
