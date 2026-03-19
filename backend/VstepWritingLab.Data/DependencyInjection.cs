using Microsoft.Extensions.DependencyInjection;
using VstepWritingLab.Domain.Interfaces;
using VstepWritingLab.Data.Firebase;
using VstepWritingLab.Data.Repositories;
using VstepWritingLab.Data.Services;
using VstepWritingLab.Business.UseCases;

namespace VstepWritingLab.Data;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        // Firebase
        services.AddSingleton<FirestoreProvider>();

        // Repositories
        services.AddScoped<IExamPromptRepository, FirestoreExamPromptRepository>();
        services.AddScoped<IGradingResultRepository, FirestoreGradingResultRepository>();
        services.AddScoped<IUserRepository, FirestoreUserRepository>();
        services.AddScoped<IProgressRepository, FirestoreProgressRepository>();

        // Services
        services.AddHttpClient<IGradingAiService, GeminiGradingAiService>();
        services.AddScoped<IRubricContextService, RubricContextService>();

        // Application Use Cases (Registered here for convenience, or in a separate Business extension)
        services.AddScoped<IGradeEssayUseCase, GradeEssayUseCase>();
        services.AddScoped<IExamPromptUseCase, ExamPromptUseCase>();
        services.AddScoped<IProgressUseCase, ProgressUseCase>();

        return services;
    }
}
