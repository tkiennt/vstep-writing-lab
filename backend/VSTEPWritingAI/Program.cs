using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Google.Cloud.Firestore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using VSTEPWritingAI.Middleware;
using VSTEPWritingAI.Repositories;
using VSTEPWritingAI.Services;

var builder = WebApplication.CreateBuilder(args);

// ── Firebase Admin SDK ────────────────────────────────────────────────────
var credentialPath = builder.Configuration["Firebase:CredentialPath"];
Environment.SetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS",
    credentialPath);

if (FirebaseApp.DefaultInstance == null)
{
    FirebaseApp.Create(new AppOptions
    {
        Credential = GoogleCredential.FromFile(credentialPath)
    });
}

// ── Firestore (Singleton) ─────────────────────────────────────────────────
var projectId = builder.Configuration["Firebase:ProjectId"];
builder.Services.AddSingleton<FirestoreDb>(_ =>
    FirestoreDb.Create(projectId));

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

// ── CORS (adjust origins for production) ─────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000",   // React dev
                "http://localhost:5173",   // Vite dev
                "https://your-production-domain.com")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// ── Repositories ──────────────────────────────────────────────────────────
builder.Services.AddScoped<UserRepository>();
builder.Services.AddScoped<QuestionRepository>();
builder.Services.AddScoped<SubmissionRepository>();
builder.Services.AddScoped<ProgressRepository>();
builder.Services.AddScoped<RubricRepository>();
builder.Services.AddScoped<TaskRepository>();
builder.Services.AddScoped<SentenceTemplateRepository>();
builder.Services.AddScoped<AiUsageLogRepository>();

// ── Services ──────────────────────────────────────────────────────────────
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<QuestionService>();
builder.Services.AddScoped<SubmissionService>();
builder.Services.AddScoped<ProgressService>();
builder.Services.AddScoped<AiGradingService>();
builder.Services.AddScoped<DataImportService>();
builder.Services.AddScoped<AdminUserService>();
builder.Services.AddScoped<AdminQuestionService>();
builder.Services.AddScoped<AdminAnalyticsService>();

// ── HttpClient for Gemini API ─────────────────────────────────────────────
builder.Services.AddHttpClient("GeminiClient", client =>
{
    client.BaseAddress = new Uri("https://generativelanguage.googleapis.com/");
    client.Timeout = TimeSpan.FromSeconds(60);
});

// ── Middleware ───────────────────────────────────────────────────────────
builder.Services.AddTransient<GlobalExceptionHandler>();

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

// Global exception handler should be high in the pipeline
app.UseMiddleware<GlobalExceptionHandler>();

// Firebase custom middleware — must come before UseAuthentication
app.UseFirebaseAuth();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();
