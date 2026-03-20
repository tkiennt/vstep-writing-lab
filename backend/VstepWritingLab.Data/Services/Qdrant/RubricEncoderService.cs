using Microsoft.Extensions.Logging;
using Qdrant.Client;
using Qdrant.Client.Grpc;
using System.Text.Json;
using VstepWritingLab.Data.Services.Gemini;

namespace VstepWritingLab.Data.Services.Qdrant;

public class RubricEncoderService(
    QdrantClient _qdrant,
    GeminiEmbeddingService _embedder,
    ILogger<RubricEncoderService> _logger)
{
    private const string COLLECTION = "vstep_knowledge";
    private const ulong  VECTOR_DIM = 768;  // text-embedding-004

    public async Task BuildAsync(CancellationToken ct = default)
    {
        // Skip if already populated
        try {
            var collections = await _qdrant.ListCollectionsAsync(cancellationToken: ct);
            if (collections.Contains(COLLECTION))
            {
                var info = await _qdrant.GetCollectionInfoAsync(COLLECTION, cancellationToken: ct);
                if ((long)info.PointsCount >= 60) {
                    _logger.LogInformation("Rubric KB already built ({N} chunks)", info.PointsCount);
                    return;
                }
            }
            else
            {
                // Create collection
                await _qdrant.CreateCollectionAsync(COLLECTION,
                    new VectorParams { Size = VECTOR_DIM, Distance = Distance.Cosine }, cancellationToken: ct);
            }
        } catch (Exception ex) {
            _logger.LogWarning(ex, "Error checking Qdrant collection, attempting to create...");
            try {
                await _qdrant.CreateCollectionAsync(COLLECTION,
                    new VectorParams { Size = VECTOR_DIM, Distance = Distance.Cosine }, cancellationToken: ct);
            } catch { /* ignore if already exists */ }
        }

        _logger.LogInformation("Building VSTEP Rubric Knowledge Base...");

        // Load rubrics_enhanced.json
        var path = Path.Combine(AppContext.BaseDirectory, "data", "rubrics_enhanced.json");
        if (!File.Exists(path)) {
            _logger.LogError("rubrics_enhanced.json not found at {Path}. Please check deployment scripts.", path);
            return;
        }

        try
        {
            using var doc = JsonDocument.Parse(await File.ReadAllTextAsync(path, ct));
            var points    = new List<PointStruct>();

            foreach (var taskProp in doc.RootElement.EnumerateObject())
            {
                if (!taskProp.Value.TryGetProperty("criteria", out var criteria)) continue;
                foreach (var critProp in criteria.EnumerateObject())
                {
                    if (!critProp.Value.TryGetProperty("descriptors", out var descs)) continue;
                    foreach (var bandProp in descs.EnumerateObject())
                    {
                        if (!int.TryParse(bandProp.Name, out var band) || band == 0) continue;

                        string textEn = "", textVi = "";
                        if (bandProp.Value.ValueKind == JsonValueKind.Object) {
                            textEn = bandProp.Value.TryGetProperty("text_en", out var e) ? e.GetString()! : "";
                            textVi = bandProp.Value.TryGetProperty("text_vi", out var v) ? v.GetString()! : "";
                        } else {
                            textEn = bandProp.Value.GetString()!;
                        }

                        var embedText = $"VSTEP {taskProp.Name} {critProp.Name} Band {band}: {textEn} | {textVi}";
                        var vector    = await _embedder.EmbedDocumentAsync(embedText);

                        points.Add(new PointStruct {
                            Id      = new PointId { Uuid = Guid.NewGuid().ToString() },
                            Vectors = new Vectors { Vector = new Vector { Data = { vector } } },
                            Payload = {
                                ["type"]      = "rubric",
                                ["task"]      = taskProp.Name,
                                ["criterion"] = critProp.Name,
                                ["band"]      = band,
                                ["text_en"]   = textEn,
                                ["text_vi"]   = textVi,
                            }
                        });
                        await Task.Delay(150, ct); // rate limit for embedding API
                    }
                }
            }

            if (points.Count > 0)
            {
                await _qdrant.UpsertAsync(COLLECTION, points, cancellationToken: ct);
                _logger.LogInformation("Rubric KB built: {N} chunks indexed", points.Count);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to build Rubric Knowledge Base");
        }
    }
}
