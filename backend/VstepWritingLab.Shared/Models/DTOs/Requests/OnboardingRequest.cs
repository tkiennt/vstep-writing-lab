namespace VstepWritingLab.Shared.Models.DTOs.Requests
{
  public class OnboardingRequest
  {
    public string DisplayName { get; set; } = string.Empty;
    public string CurrentLevel { get; set; } = string.Empty;
    public string TargetLevel { get; set; } = string.Empty;
  }
}
