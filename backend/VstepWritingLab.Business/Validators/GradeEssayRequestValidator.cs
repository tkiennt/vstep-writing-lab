using FluentValidation;
using VstepWritingLab.Business.DTOs;

namespace VstepWritingLab.Business.Validators;

public class GradeEssayRequestValidator : AbstractValidator<GradeEssayRequest>
{
    public GradeEssayRequestValidator()
    {
        RuleFor(x => x.EssayId).NotEmpty().WithMessage("Essay identification is required.");
        RuleFor(x => x.Prompt).NotEmpty().WithMessage("Original prompt instruction is required.");
        RuleFor(x => x.EssayText)
            .NotEmpty().WithMessage("Essay content is required.")
            .MinimumLength(50).WithMessage("Essay content is too short (min 50 chars).");
        RuleFor(x => x.TaskType)
            .Must(x => x.ToLower() == "task1" || x.ToLower() == "task2")
            .WithMessage("Task type must be task1 or task2.");
        RuleFor(x => x.WordCount).GreaterThan(0).WithMessage("Word count must be greater than zero.");
    }
}
