using Google.Cloud.Firestore;
using System.Collections.Generic;
using VstepWritingLab.Shared.Models.Common;

namespace VstepWritingLab.Shared.Models.Entities
{
    [FirestoreData]
    public class ProgressModel
    {
        [FirestoreDocumentId]
        public string UserId { get; set; }

        [FirestoreProperty] public int TotalEssays { get; set; }
        [FirestoreProperty] public int Task1Count { get; set; }
        [FirestoreProperty] public int Task2Count { get; set; }

        [FirestoreProperty] public double AverageScoreTask1 { get; set; }
        // Average of all task1 submissions for this user

        [FirestoreProperty] public double AverageScoreTask2 { get; set; }
        // Average of all task2 submissions for this user

        [FirestoreProperty] public double WeightedOverallScore { get; set; }
        // = (AverageScoreTask1 * 0.333) + (AverageScoreTask2 * 0.667)
        // Reflects official VSTEP scoring weight

        [FirestoreProperty] public List<ScoreHistoryItem> ScoreHistory { get; set; }
        // Ordered by date ascending, used for score trend chart

        [FirestoreProperty] public Dictionary<string, double> AverageBySkill { get; set; }
        // Keys: "taskFulfilment", "organization", "vocabulary", "grammar"
        // Values: average score (0-10) across all submissions

        [FirestoreProperty] public List<string> WeakSkills { get; set; }
        // 2 keys from AverageBySkill with lowest values
        // Recalculated by backend on every update

        [FirestoreProperty] public int Streak { get; set; }
        // Consecutive days with at least 1 submission

        [FirestoreProperty] public Timestamp LastUpdatedAt { get; set; }
    }
}
