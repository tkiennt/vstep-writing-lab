using System;
using System.Threading.Tasks;
using MassTransit;
using Microsoft.Extensions.Logging;
using VstepWritingLab.Business.DTOs;
using VstepWritingLab.Business.Events;
using VstepWritingLab.Domain.Entities;

namespace VstepWritingLab.Business.Services;

public interface IBackgroundGradingService
{
    void EnqueueGradingTask(
        string resultId,
        GradeEssayCommand command,
        ExamPrompt exam,
        string rubricContext);
}

/// <summary>
/// Publishes grading tasks to RabbitMQ via MassTransit.
/// The actual AI work is done by GradeEssayConsumer in the API project.
/// </summary>
public class RabbitMqBackgroundGradingService(
    IPublishEndpoint publishEndpoint,
    ILogger<RabbitMqBackgroundGradingService> logger) : IBackgroundGradingService
{
    public void EnqueueGradingTask(
        string resultId,
        GradeEssayCommand command,
        ExamPrompt exam,
        string rubricContext)
    {
        // Fire-and-forget: publish message to broker without blocking the HTTP response
        _ = Task.Run(async () =>
        {
            try
            {
                await publishEndpoint.Publish(new GradeEssayMessage(resultId, command, exam, rubricContext));
                logger.LogInformation("Published GradeEssayMessage to RabbitMQ for ResultId={ResultId}", resultId);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to publish GradeEssayMessage to RabbitMQ for ResultId={ResultId}", resultId);
            }
        });
    }
}
