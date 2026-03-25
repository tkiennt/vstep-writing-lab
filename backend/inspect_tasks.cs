using Google.Cloud.Firestore;
using System;
using System.Threading.Tasks;

var db = FirestoreDb.Create("vstep-writing-lab");
var snapshot = await db.Collection("tasks").Limit(5).GetSnapshotAsync();

Console.WriteLine($"Found {snapshot.Count} tasks.");
foreach (var doc in snapshot.Documents)
{
    Console.WriteLine($"ID: {doc.Id}");
    foreach (var field in doc.ToDictionary())
    {
        Console.WriteLine($"  {field.Key}: {field.Value}");
    }
}
