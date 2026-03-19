namespace VstepWritingLab.Domain.ValueObjects;

public record Correction(
    string Original, string Corrected, string ReasonEn, string ReasonVi);
