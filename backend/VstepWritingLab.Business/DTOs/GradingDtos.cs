namespace VstepWritingLab.Business.DTOs;

public record GradeEssayRequest(
    string UserUid,
    string PromptId,
    string Content,
    string TaskType
);

public record GradingResultDto(
    string Id,
    string UserUid,
    string PromptId,
    double TotalScore,
    string CefrLevel,
    string Feedback,
    DateTime CreatedAt
);
