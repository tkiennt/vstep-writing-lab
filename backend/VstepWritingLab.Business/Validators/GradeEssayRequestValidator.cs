using FluentValidation;
using VstepWritingLab.Business.DTOs;

namespace VstepWritingLab.Business.Validators;

public class GradeEssayRequestValidator : AbstractValidator<GradeEssayRequest>
{
    public GradeEssayRequestValidator()
    {
        RuleFor(x => x.UserUid).NotEmpty().WithMessage("User identification is required.");
        RuleFor(x => x.PromptId).NotEmpty().WithMessage("Exam prompt identification is required.");
        RuleFor(x => x.Content)
            .NotEmpty().WithMessage("Essay content is required.")
            .MinimumLength(50).WithMessage("Essay content is too short.");
        RuleFor(x => x.TaskType)
            .Must(x => x == "Task1" || x == "Task2")
            .WithMessage("Task type must be Task1 or Task2.");
    }
}
