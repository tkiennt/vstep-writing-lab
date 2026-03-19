using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;
using VSTEPWritingAI.Exceptions;

namespace VSTEPWritingAI.Middleware
{
    public class GlobalExceptionHandler : IMiddleware
    {
        private readonly ILogger<GlobalExceptionHandler> _logger;

        public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
        {
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context, RequestDelegate next)
        {
            try
            {
                await next(context);
            }
            catch (UnauthorizedException ex)
            {
                context.Response.StatusCode = 401;
                await context.Response.WriteAsJsonAsync(
                    new { message = ex.Message });
            }
            catch (ForbiddenException ex)
            {
                context.Response.StatusCode = 403;
                await context.Response.WriteAsJsonAsync(
                    new { message = ex.Message });
            }
            catch (NotFoundException ex)
            {
                context.Response.StatusCode = 404;
                await context.Response.WriteAsJsonAsync(
                    new { message = ex.Message });
            }
            catch (ValidationException ex)
            {
                context.Response.StatusCode = 400;
                await context.Response.WriteAsJsonAsync(
                    new { message = "Validation failed", errors = ex.Errors });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled exception");
                context.Response.StatusCode = 500;
                await context.Response.WriteAsJsonAsync(
                    new { message = "An unexpected error occurred" });
            }
        }
    }
}
