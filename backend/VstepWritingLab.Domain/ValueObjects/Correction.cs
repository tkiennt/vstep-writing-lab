using Google.Cloud.Firestore;

namespace VstepWritingLab.Domain.ValueObjects;

[FirestoreData]
public record Correction(
    [property: FirestoreProperty("original")] string Original,
    [property: FirestoreProperty("corrected")] string Corrected,
    [property: FirestoreProperty("reasonEn")] string ReasonEn,
    [property: FirestoreProperty("reasonVi")] string ReasonVi
);
