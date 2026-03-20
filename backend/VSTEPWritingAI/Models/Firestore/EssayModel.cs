using Google.Cloud.Firestore;
using System;
using System.Collections.Generic;

namespace VSTEPWritingAI.Models.Firestore
{
    [FirestoreData]
    public class Scores
    {
        [FirestoreProperty] public double TaskFulfilment { get; set; }
        [FirestoreProperty] public double Organization { get; set; }
        [FirestoreProperty] public double Vocabulary { get; set; }
        [FirestoreProperty] public double Grammar { get; set; }
    }

    [FirestoreData]
    public class FeedbackItem
    {
        [FirestoreProperty] public string FeedbackEn { get; set; } = "";
        [FirestoreProperty] public string FeedbackVi { get; set; } = "";
    }

    [FirestoreData]
    public class Feedback
    {
        [FirestoreProperty] public FeedbackItem TaskFulfilment { get; set; } = new();
        [FirestoreProperty] public FeedbackItem Organization { get; set; } = new();
        [FirestoreProperty] public FeedbackItem Vocabulary { get; set; } = new();
        [FirestoreProperty] public FeedbackItem Grammar { get; set; } = new();
    }

    [FirestoreData]
    public class Essay
    {
        [FirestoreProperty] public string EssayId { get; set; } = "";
        [FirestoreProperty] public string ExamId { get; set; } = "";
        [FirestoreProperty] public string StudentId { get; set; } = "";
        [FirestoreProperty] public string TaskType { get; set; } = "";
        [FirestoreProperty] public string TopicCategory { get; set; } = "";
        [FirestoreProperty] public string TopicKeyword { get; set; } = "";
        [FirestoreProperty] public string CefrLevel { get; set; } = "";
        [FirestoreProperty] public double TotalScore { get; set; }
        [FirestoreProperty] public Scores Scores { get; set; } = new();
        [FirestoreProperty] public Feedback Feedback { get; set; } = new();
        [FirestoreProperty] public List<string> Corrections { get; set; } = new();
        [FirestoreProperty] public string Status { get; set; } = "";
        [FirestoreProperty] public DateTime SubmittedAt { get; set; }
        [FirestoreProperty] public string BandComparison { get; set; } = "";
        [FirestoreProperty] public string EssayContent { get; set; } = "";
    }
}
