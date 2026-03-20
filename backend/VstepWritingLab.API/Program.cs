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
    // Resolve relative path (e.g. ../firebase-service-account.json) to absolute
    var fullPath = Path.GetFullPath(credentialPath);
    if (!File.Exists(fullPath))
        fullPath = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, credentialPath));
    if (File.Exists(fullPath))
    {
        Environment.SetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS", fullPath);
        if (FirebaseApp.DefaultInstance == null)
        {
            using var stream = new FileStream(fullPath, FileMode.Open, FileAccess.Read);
            FirebaseApp.Create(new AppOptions
            {
                Credential = GoogleCredential.FromStream(stream)
            });
        }
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
        policy.SetIsOriginAllowed(origin =>
            {
                if (string.IsNullOrEmpty(origin)) return false;
                try
                {
                    var uri = new Uri(origin);
                    return uri.Host == "localhost" || uri.Host == "127.0.0.1";
                }
                catch { return false; }
            })
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

// ── Middleware ───────────────────────────────────────────────────────────
builder.Services.AddTransient<GlobalExceptionHandler>();

builder.Services.AddMemoryCache();
builder.Services.AddResponseCaching();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();



// ── Middleware Pipeline (ORDER MATTERS) ───────────────────────────────────
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");

// Global exception handler
app.UseMiddleware<GlobalExceptionHandler>();

// Firebase custom middleware (role check)
app.UseAuthentication();
app.UseMiddleware<FirebaseAuthMiddleware>();
app.UseAuthorization();

app.MapControllers();
app.Run();
