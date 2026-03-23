using System.IO;
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Google.Cloud.Firestore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using VstepWritingLab.API.Middleware;
using VstepWritingLab.Data.Repositories;
using VstepWritingLab.Business.Services;
using VstepWritingLab.Business.Interfaces;
using VstepWritingLab.Data;
using VstepWritingLab.Data.Services.Qdrant;

var builder = WebApplication.CreateBuilder(args);

// ── Firebase Admin SDK ────────────────────────────────────────────────────
var credentialPath = builder.Configuration["Firebase:CredentialPath"];
if (!string.IsNullOrEmpty(credentialPath))
{
    Environment.SetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS", credentialPath);

    if (FirebaseApp.DefaultInstance == null)
    {
        using var stream = new FileStream(credentialPath, FileMode.Open, FileAccess.Read);
        FirebaseApp.Create(new AppOptions
        {
            Credential = GoogleCredential.FromFile(credentialPath)
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
    });

// ── Authorization Policies ────────────────────────────────────────────────
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("StudentOrAdmin", policy =>
        policy.RequireRole("student", "admin"));

    options.AddPolicy("AdminOnly", policy =>
        policy.RequireRole("admin"));
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000",   // React dev
                "http://localhost:3001",   // Next.js dev alternate port
                "http://localhost:5173",   // Vite dev
                "https://your-production-domain.com")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// ── Infrastructure & Application (Clean Architecture) ────────────────────────
builder.Services.AddInfrastructure(builder.Configuration);

// ── Legacy Repositories (some might be redundant but kept for now) ────────────
builder.Services.AddScoped<ILegacyUserRepository, UserRepository>();
builder.Services.AddScoped<IQuestionRepository, QuestionRepository>();
builder.Services.AddScoped<ISubmissionRepository, SubmissionRepository>();
builder.Services.AddScoped<ILegacyProgressRepository, ProgressRepository>();
builder.Services.AddScoped<IRubricRepository, RubricRepository>();
builder.Services.AddScoped<ITaskRepository, TaskRepository>();
builder.Services.AddScoped<ISentenceTemplateRepository, SentenceTemplateRepository>();
builder.Services.AddScoped<IAiUsageLogRepository, AiUsageLogRepository>();

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
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection();
app.UseCors("AllowFrontend");

// Global exception handler
app.UseMiddleware<GlobalExceptionHandler>();

// Firebase custom middleware (role check)
app.UseAuthentication();
app.UseMiddleware<FirebaseAuthMiddleware>();
app.UseAuthorization();

app.MapControllers();
app.Run();
