using System.IO;
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Google.Cloud.Firestore;
using MassTransit;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.SignalR;
using Microsoft.IdentityModel.Tokens;
using VstepWritingLab.API.Hubs;
using VstepWritingLab.API.Consumers;
using VstepWritingLab.API.Middleware;
using VstepWritingLab.Data.Repositories;
using VstepWritingLab.Business.Services;
using VstepWritingLab.Business.Interfaces;
using VstepWritingLab.Data;
using VstepWritingLab.Data.Services.Qdrant;

var builder = WebApplication.CreateBuilder(args);

// ── Firebase Admin SDK ────────────────────────────────────────────────────
// 1. Explicit path from appsettings (local dev)
// 2. GOOGLE_APPLICATION_CREDENTIALS env var (Cloud Run / GCP — set at runtime)
var credentialPath = builder.Configuration["Firebase:CredentialPath"];
var gcpCredentialEnv = Environment.GetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS");

if (!string.IsNullOrEmpty(credentialPath) && File.Exists(credentialPath))
{
    Environment.SetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS", credentialPath);

    if (FirebaseApp.DefaultInstance == null)
    {
        FirebaseApp.Create(new AppOptions
        {
            Credential = GoogleCredential.FromFile(credentialPath),
            ProjectId = "vstep-writing-lab"
        });
    }
}
else if (!string.IsNullOrEmpty(gcpCredentialEnv) && File.Exists(gcpCredentialEnv))
{
    // Cloud Run: secret file mounted at GOOGLE_APPLICATION_CREDENTIALS
    if (FirebaseApp.DefaultInstance == null)
    {
        FirebaseApp.Create(new AppOptions
        {
            Credential = GoogleCredential.FromFile(gcpCredentialEnv),
            ProjectId = "vstep-writing-lab"
        });
    }
}
else
{
    // Fallback: Application Default Credentials (if running on GCP with Workload Identity)
    if (FirebaseApp.DefaultInstance == null)
    {
        FirebaseApp.Create(new AppOptions
        {
            Credential = await GoogleCredential.GetApplicationDefaultAsync(),
            ProjectId = "vstep-writing-lab"
        });
    }
}

// ── JWT Authentication (Firebase tokens) ─────────────────────────────────
var validIssuer   = builder.Configuration["Jwt:ValidIssuer"];
var validAudience = builder.Configuration["Jwt:ValidAudience"];

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = validIssuer;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer   = true,
            ValidIssuer      = validIssuer,
            ValidateAudience = true,
            ValidAudience    = validAudience,
            ValidateLifetime = true
        };

        // Allow JWT token in query string for SignalR WebSocket connections
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });

// ── Authorization Policies ────────────────────────────────────────────────
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("StudentOrAdmin", policy =>
        policy.RequireRole("student", "admin"));

    options.AddPolicy("AdminOnly", policy =>
        policy.RequireRole("admin"));
});

// ── CORS (must allow credentials for SignalR WebSocket) ───────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.SetIsOriginAllowed(origin => 
                  origin.StartsWith("http://localhost") || 
                  origin.EndsWith(".vercel.app"))
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // Required for SignalR
    });
});

// ── SignalR ───────────────────────────────────────────────────────────────
builder.Services.AddSignalR();

// Allow GradingHub to identify users by their Firebase UID (sub claim)
builder.Services.AddSingleton<IUserIdProvider, FirebaseUserIdProvider>();

// ── MassTransit (RabbitMQ / In-Memory Toggle) ──────────────────────────────
var useRabbitMq = builder.Configuration.GetValue<bool>("RabbitMQ:Enabled", false);

builder.Services.AddMassTransit(x =>
{
    x.AddConsumer<GradeEssayScoresConsumer>();
    x.AddConsumer<GradeEssayDetailsConsumer>();

    if (useRabbitMq)
    {
        var rabbitHost = builder.Configuration["RabbitMQ:Host"] ?? "localhost";
        x.UsingRabbitMq((ctx, cfg) =>
        {
            cfg.Host(rabbitHost, "/", h =>
            {
                h.Username(builder.Configuration["RabbitMQ:Username"] ?? "guest");
                h.Password(builder.Configuration["RabbitMQ:Password"] ?? "guest");
            });

            // Configure retry policy for production (RabbitMQ)
            cfg.UseMessageRetry(r => r.Exponential(3, TimeSpan.FromSeconds(2), TimeSpan.FromSeconds(30), TimeSpan.FromSeconds(2)));

            cfg.ConfigureEndpoints(ctx);
        });
    }
    else
    {
        x.UsingInMemory((ctx, cfg) =>
        {
            // Configure retry policy for development (InMemory)
            cfg.UseMessageRetry(r => r.Exponential(3, TimeSpan.FromSeconds(2), TimeSpan.FromSeconds(30), TimeSpan.FromSeconds(2)));

            cfg.ConfigureEndpoints(ctx);
        });
    }
});

// The Background Grading service relies on IPublishEndpoint, 
// which MassTransit automatically injects regardless of the transport used.
builder.Services.AddScoped<IBackgroundGradingService, RabbitMqBackgroundGradingService>();
builder.Services.AddScoped<VstepWritingLab.Domain.Interfaces.IRubricContextService, VstepWritingLab.Data.Services.Qdrant.RubricContextService>();

// ── Infrastructure & Application (Clean Architecture) ────────────────────────
builder.Services.AddInfrastructure(builder.Configuration);

// ── Legacy Repositories ────────────────────────────────────────────────────
builder.Services.AddScoped<ILegacyUserRepository, UserRepository>();
builder.Services.AddScoped<IQuestionRepository, QuestionRepository>();
builder.Services.AddScoped<ISubmissionRepository, SubmissionRepository>();
builder.Services.AddScoped<ILegacyProgressRepository, ProgressRepository>();
builder.Services.AddScoped<IRubricRepository, RubricRepository>();
builder.Services.AddScoped<ITaskRepository, TaskRepository>();
builder.Services.AddScoped<ISentenceTemplateRepository, SentenceTemplateRepository>();
builder.Services.AddScoped<IAiUsageLogRepository, AiUsageLogRepository>();
builder.Services.AddScoped<IAuditLogRepository, AuditLogRepository>();

// ── Legacy Services ──────────────────────────────────────────────────────────
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<QuestionService>();
builder.Services.AddScoped<SubmissionService>();
builder.Services.AddScoped<ProgressService>();
builder.Services.AddScoped<AiGradingService>();
builder.Services.AddScoped<DataImportService>();
builder.Services.AddScoped<AdminUserService>();
builder.Services.AddScoped<AdminQuestionService>();
builder.Services.AddScoped<AdminAnalyticsService>();
builder.Services.AddScoped<AdminEssayService>();
builder.Services.AddScoped<AdminAiMonitorService>();
builder.Services.AddScoped<AdminReportsService>();
builder.Services.AddScoped<AdminAuditLogService>();
builder.Services.AddScoped<RubricService>();
builder.Services.AddScoped<ITopicService, TopicService>();
builder.Services.AddScoped<IEssayService, EssayService>();
builder.Services.AddScoped<IOutlineService, OutlineService>();
builder.Services.AddScoped<IUserService, UserService>();

// ── Middleware ───────────────────────────────────────────────────────────
builder.Services.AddTransient<GlobalExceptionHandler>();
builder.Services.AddMemoryCache();
builder.Services.AddResponseCaching();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

    // ── Middleware Pipeline (ORDER MATTERS) ───────────────────────────────────
app.UseSwagger();
app.UseSwaggerUI();

// app.UseHttpsRedirection();
app.UseCors("AllowFrontend"); // Must be before UseAuthentication for SignalR

// Global exception handler
app.UseMiddleware<GlobalExceptionHandler>();

// Firebase custom middleware (role check)
app.UseAuthentication();
app.UseMiddleware<FirebaseAuthMiddleware>();
app.UseAuthorization();

app.MapControllers();

// ── SignalR Endpoints ────────────────────────────────────────────────────
app.MapHub<GradingHub>("/hubs/grading");

// ── Health Checks ─────────────────────────────────────────────────────────
app.MapGet("/health", () => Results.Ok("ok"));
app.MapGet("/api/ping", () => Results.Ok("pong"));

app.Run();
