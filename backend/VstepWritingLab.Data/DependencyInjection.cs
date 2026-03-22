using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using System;
using VstepWritingLab.Domain.Interfaces;
using VstepWritingLab.Data.Firebase;
using VstepWritingLab.Data.Repositories;
using VstepWritingLab.Data.Services;
using VstepWritingLab.Data.Services.Gemini;
using VstepWritingLab.Data.Services.Qdrant;
using VstepWritingLab.Business.UseCases;
using Google.Cloud.Firestore;
using Qdrant.Client;

namespace VstepWritingLab.Data;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration config)
    {
        // Firebase
        services.AddSingleton(sp => {
            var projectId = config["Firebase:ProjectId"] ?? "vstep-writing-lab";
            return FirestoreDb.Create(projectId);
        });
        services.AddSingleton<FirestoreProvider>();

        // Repositories
        services.AddScoped<IExamPromptRepository, FirestoreExamPromptRepository>();
        services.AddScoped<IGradingResultRepository, FirestoreGradingResultRepository>();
        services.AddScoped<IUserRepository, FirestoreUserRepository>();
        services.AddScoped<IProgressRepository, FirestoreProgressRepository>();

        // Gemini Services — typed client (grading pipeline)
        services.AddHttpClient<GeminiClient>();
        services.AddSingleton<GeminiClient>();
        services.AddSingleton<IGradingAiService, GeminiGradingService>();

        // Named client for OutlineService / legacy AiGradingService (relative v1beta/... URLs)
        services.AddHttpClient("GeminiClient", client =>
        {
            client.BaseAddress = new Uri("https://generativelanguage.googleapis.com/");
            client.Timeout = TimeSpan.FromSeconds(120);
        });


        // Qdrant + RAG
        services.AddSingleton(sp => new QdrantClient(
            config["Qdrant:Host"] ?? "localhost",
            int.Parse(config["Qdrant:Port"] ?? "6334")));
        services.AddSingleton<IRubricContextService, RubricContextService>();


        // Cache
        services.AddMemoryCache();

        // Application Use Cases
        services.AddScoped<IGradeEssayUseCase, GradeEssayUseCase>();
        services.AddScoped<IExamPromptUseCase, ExamPromptUseCase>();
        services.AddScoped<IProgressUseCase, ProgressUseCase>();

        return services;
    }
}
