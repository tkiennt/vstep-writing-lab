using Google.Cloud.Firestore;
using System.Text.Json;
using VSTEPWritingAI.Models.Firestore;
using VSTEPWritingAI.Models.Common;
using VSTEPWritingAI.Models.DTOs.Responses;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace VSTEPWritingAI.Services
{
    public class DataImportService
    {
        private readonly FirestoreDb _db;
        private readonly ILogger<DataImportService> _logger;

        public DataImportService(
            FirestoreDb db,
            ILogger<DataImportService> logger)
        {
            _db = db;
            _logger = logger;
        }


        // ─────────────────────────────────────────────────────────────────────
        // IMPORT TASKS (from tasks.json)
        // Run once. Document IDs = "task1", "task2"
        // ─────────────────────────────────────────────────────────────────────

        public async Task<ImportResultResponse> ImportTasksAsync(string jsonContent)
        {
            var result = new ImportResultResponse();

            try
            {
                // tasks.json format: { "task1": {...}, "task2": {...} }
                var tasksDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(
                    jsonContent,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                if (tasksDict == null || tasksDict.Count == 0)
                {
                    result.Success = false;
                    result.Message = "Empty or invalid tasks.json";
                    return result;
                }

                result.TotalProcessed = tasksDict.Count;

                foreach (var (taskId, taskJson) in tasksDict)
                {
                    try
                    {
                        var task = new TaskModel
                        {
                            TaskId      = taskId,
                            Name        = taskJson.GetProperty("name").GetString(),
                            Type        = taskJson.GetProperty("type").GetString(),
                            Duration    = taskJson.GetProperty("duration").GetInt32(),
                            MinWords    = taskJson.GetProperty("minWords").GetInt32(),
                            MaxWords    = taskJson.TryGetProperty("maxWords", out var mw)
                                            && mw.ValueKind != JsonValueKind.Null
                                            ? mw.GetInt32() : null,
                            ScoreWeight = taskJson.GetProperty("scoreWeight").GetDouble(),
                            Description = taskJson.GetProperty("description").GetString(),
                            IsActive    = taskJson.GetProperty("isActive").GetBoolean()
                        };

                        // Use document ID = taskId ("task1" | "task2")
                        await _db.Collection("tasks")
                            .Document(taskId)
                            .SetAsync(task, SetOptions.MergeAll);

                        result.TotalImported++;
                        _logger.LogInformation("Imported task: {TaskId}", taskId);
                    }
                    catch (Exception ex)
                    {
                        result.TotalSkipped++;
                        result.Errors.Add($"{taskId}: {ex.Message}");
                        _logger.LogError(ex, "Failed to import task: {TaskId}", taskId);
                    }
                }

                result.Success = result.Errors.Count == 0;
                result.Message = $"Tasks import complete. " +
                                 $"Imported: {result.TotalImported}, " +
                                 $"Skipped: {result.TotalSkipped}";
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.Message = $"Fatal error during tasks import: {ex.Message}";
                _logger.LogError(ex, "Fatal error importing tasks");
            }

            return result;
        }


        // ─────────────────────────────────────────────────────────────────────
        // IMPORT QUESTIONS (from questions.json)
        // Repeatable. Document IDs = from JSON keys (q001, q002, ...)
        // Handles > 500 items by splitting into batches automatically
        // ─────────────────────────────────────────────────────────────────────

        public async Task<ImportResultResponse> ImportQuestionsAsync(string jsonContent)
        {
            var result = new ImportResultResponse();

            try
            {
                // questions.json format: { "q001": {...}, "q002": {...}, ... }
                var questionsDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(
                    jsonContent,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                if (questionsDict == null || questionsDict.Count == 0)
                {
                    result.Success = false;
                    result.Message = "Empty or invalid questions.json";
                    return result;
                }

                result.TotalProcessed = questionsDict.Count;

                // Split into batches of 500 (Firestore limit)
                const int batchSize = 500;
                var entries = questionsDict.ToList();
                var batches = entries
                    .Select((item, index) => new { item, index })
                    .GroupBy(x => x.index / batchSize)
                    .Select(g => g.Select(x => x.item).ToList())
                    .ToList();

                _logger.LogInformation(
                    "Importing {Total} questions in {Batches} batch(es)",
                    questionsDict.Count, batches.Count);

                foreach (var batch in batches)
                {
                    var writeBatch = _db.StartBatch();

                    foreach (var (questionId, questionJson) in batch)
                    {
                        try
                        {
                            var question = new QuestionModel
                            {
                                QuestionId   = questionId,
                                TaskType     = questionJson.GetProperty("taskType").GetString(),
                                Category     = questionJson.GetProperty("category").GetString(),
                                Title        = questionJson.GetProperty("title").GetString(),
                                Instructions = questionJson.GetProperty("instructions").GetString(),
                                Requirements = questionJson.TryGetProperty("requirements", out var req)
                                                ? req.EnumerateArray()
                                                     .Select(r => r.GetString() ?? "")
                                                     .ToList()
                                                : new List<string>(),
                                Level        = questionJson.GetProperty("level").GetString(),
                                IsActive     = questionJson.TryGetProperty("isActive", out var active)
                                                ? active.GetBoolean() : true,
                                ImportedAt   = Timestamp.GetCurrentTimestamp()
                            };

                            var docRef = _db.Collection("questions").Document(questionId);
                            writeBatch.Set(docRef, question, SetOptions.MergeAll);
                            result.TotalImported++;
                        }
                        catch (Exception ex)
                        {
                            result.TotalSkipped++;
                            result.Errors.Add($"{questionId}: {ex.Message}");
                            _logger.LogError(ex,
                                "Failed to prepare question: {QuestionId}", questionId);
                        }
                    }

                    await writeBatch.CommitAsync();
                    _logger.LogInformation("Committed batch of {Count}", batch.Count);
                }

                result.Success = result.Errors.Count == 0;
                result.Message = $"Questions import complete. " +
                                 $"Imported: {result.TotalImported}, " +
                                 $"Skipped: {result.TotalSkipped}";
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.Message = $"Fatal error during questions import: {ex.Message}";
                _logger.LogError(ex, "Fatal error importing questions");
            }

            return result;
        }


        // ─────────────────────────────────────────────────────────────────────
        // IMPORT SENTENCE TEMPLATES (from JSON batch)
        // Repeatable. Document IDs = tmpl_{taskType}_{category}_{part}
        // ─────────────────────────────────────────────────────────────────────

        public async Task<ImportResultResponse> ImportSentenceTemplatesAsync(
            string jsonContent)
        {
            var result = new ImportResultResponse();

            try
            {
                // Expected format: array of template objects
                var templateList = JsonSerializer.Deserialize<List<JsonElement>>(
                    jsonContent,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                if (templateList == null || templateList.Count == 0)
                {
                    result.Success = false;
                    result.Message = "Empty or invalid sentence templates JSON";
                    return result;
                }

                result.TotalProcessed = templateList.Count;
                var batch = _db.StartBatch();

                foreach (var item in templateList)
                {
                    try
                    {
                        var taskType = item.GetProperty("taskType").GetString();
                        var category = item.GetProperty("category").GetString();
                        var part     = item.GetProperty("part").GetString();

                        // Build document ID from convention
                        var templateId = $"tmpl_{taskType}_{category}_{part}";

                        var model = new SentenceTemplateModel
                        {
                            TemplateId = templateId,
                            TaskType   = taskType,
                            Category   = category,
                            Part       = part,
                            Templates  = item.GetProperty("templates")
                                            .EnumerateArray()
                                            .Select(t => t.GetString() ?? "")
                                            .ToList(),
                            IsActive   = true
                        };

                        var docRef = _db.Collection("sentenceTemplates")
                                        .Document(templateId);
                        batch.Set(docRef, model, SetOptions.MergeAll);
                        result.TotalImported++;
                    }
                    catch (Exception ex)
                    {
                        result.TotalSkipped++;
                        result.Errors.Add(ex.Message);
                        _logger.LogError(ex, "Failed to prepare sentence template");
                    }
                }

                await batch.CommitAsync();

                result.Success = result.Errors.Count == 0;
                result.Message = $"Sentence templates import complete. " +
                                 $"Imported: {result.TotalImported}, " +
                                 $"Skipped: {result.TotalSkipped}";
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.Message = $"Fatal error during template import: {ex.Message}";
                _logger.LogError(ex, "Fatal error importing sentence templates");
            }

            return result;
        }


        // ─────────────────────────────────────────────────────────────────────
        // SEED RUBRICS (hardcoded from official VSTEP rubric)
        // Run once. Document IDs = "vstep_task1", "vstep_task2"
        // ─────────────────────────────────────────────────────────────────────

        public async Task<ImportResultResponse> SeedRubricsAsync()
        {
            var result = new ImportResultResponse { TotalProcessed = 2 };

            try
            {
                var rubricTask1 = BuildTask1Rubric();
                var rubricTask2 = BuildTask2Rubric();

                await _db.Collection("rubrics")
                    .Document("vstep_task1")
                    .SetAsync(rubricTask1, SetOptions.MergeAll);

                await _db.Collection("rubrics")
                    .Document("vstep_task2")
                    .SetAsync(rubricTask2, SetOptions.MergeAll);

                result.TotalImported = 2;
                result.Success = true;
                result.Message = "Rubrics seeded successfully (vstep_task1, vstep_task2)";
                _logger.LogInformation("Rubrics seeded successfully");
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.Message = $"Failed to seed rubrics: {ex.Message}";
                _logger.LogError(ex, "Failed to seed rubrics");
            }

            return result;
        }

        // ── Task 1 Rubric Builder ─────────────────────────────────────────────

        private RubricModel BuildTask1Rubric() => new RubricModel
        {
            RubricId = "vstep_task1",
            TaskType = "task1",
            Name     = "VSTEP Writing Rating Scale - Task 1",
            Source   = "ULIS-VNU",
            Scale    = new RubricScaleModel { Min = 0, Max = 10, Step = 1 },
            Criteria = new Dictionary<string, RubricCriterionModel>
            {
                ["taskFulfilment"] = new RubricCriterionModel
                {
                    Weight = 1,
                    SubFactors = new List<string>
                    {
                        "requirements (format & length)",
                        "purposes (invitation/request/formal-informal)",
                        "tone (formal-informal)",
                        "key points"
                    },
                    Descriptors = new Dictionary<string, string>
                    {
                        ["10"] = "Covers all the requirements of the task effectively; effectively fulfils all communicative purposes with tone consistent and appropriate; fully develops key points with all the details relevant",
                        ["9"]  = "Covers all the requirements of the task effectively; clearly fulfils all communicative purposes with tone consistent and appropriate; fully develops key points with all the details generally relevant",
                        ["8"]  = "Covers all the requirements of the task; presents generally clear communicative purposes with one or two minor inconsistencies and inappropriacies in tone; develops key points with most of the details generally relevant",
                        ["7"]  = "Covers all the requirements of the task; format may be inappropriate in places; presents generally clear communicative purposes with some inconsistencies (3-4 times) and inappropriacies in tone; adequately (fall 3-4 key points) presents key points but one or two details may be inappropriate",
                        ["6"]  = "Covers almost all (lack 10-15% words) the requirements of the task; the format may be inappropriate in places; presents generally clear communicative purposes with some inconsistencies (5-6 times) and inappropriacies and appropriate; adequately presents key points but a few (3-4) details may be inappropriate",
                        ["5"]  = "Partially (lack 16-29% words) covers the requirements of the task; presents communicative purposes which are unclear in places; there are some inconsistencies and inappropriacies in tone; inadequately (miss 1 key point) presents key points; there may be a tendency to focus on details",
                        ["4"]  = "Partially (lack >25% words) covers the requirements of the task; fails to clearly present communicative purpose(s); the tone may be inappropriate",
                        ["3"]  = "Does not address any part of the task; presents limited ideas which may be largely irrelevant/repetitive",
                        ["2"]  = "Does not address any part of the task",
                        ["1"]  = "Answer is totally irrelevant; does not attend the exam; does not write any words; writes only a memorized response",
                        ["0"]  = "Does not attend the exam"
                    }
                },
                ["organization"] = new RubricCriterionModel
                {
                    Weight = 1,
                    SubFactors = new List<string>
                    {
                        "coherence",
                        "cohesion",
                        "ideas & info unified and well-developed",
                        "cohesive devices",
                        "paragraphing (main + supporting ideas)"
                    },
                    Descriptors = new Dictionary<string, string>
                    {
                        ["10"] = "Organizes information and ideas logically (coherent; logical order); uses a variety (quantity) as well as a range (number of types and quality) of cohesive devices and organizational patterns (less explicit connection: arranging sentences, parallelism) flexibly (use smoothly); uses paragraphing sufficiently and appropriately",
                        ["9"]  = "Organizes information and ideas coherently; uses a variety as well as a range of cohesive devices and organizational patterns effectively (use successfully); uses paragraphing sufficiently and appropriately",
                        ["8"]  = "Organizes information and ideas coherently; uses a range of linking words and cohesive devices appropriately, though there may be some under/over use; uses paragraphing appropriately",
                        ["7"]  = "Organizes information and ideas coherently; uses a variety (quantity) of linking words and a number of cohesive devices accurately within and across sentences, but there may be occasional inappropriacies. Linking words: high frequency linking words: and, but, or. Cohesive devices: more sophisticated linking devices: ellipsis, substitution, reference pronouns, sophisticated phrases: for example, in addition, furthermore...",
                        ["6"]  = "Organizes information and ideas generally coherently; uses linking words and a limited number of cohesive devices within and across sentences accurately, but there are some inappropriacies",
                        ["5"]  = "Organizes information and ideas fairly coherently; uses linking words and some familiar cohesive devices within and across sentences accurately though there may be inaccuracies",
                        ["4"]  = "Presents information and ideas with some organization; uses linking words accurately and attempts a few familiar cohesive devices within and across sentences, though there may be repetitions or inaccuracies",
                        ["3"]  = "Presents information and ideas in a series of simple sentences linked by only basic, high-frequency linking words",
                        ["2"]  = "Has very little control of organizational features",
                        ["1"]  = "Has no organizational features",
                        ["0"]  = "Does not write any words"
                    }
                },
                ["vocabulary"] = new RubricCriterionModel
                {
                    Weight = 1,
                    SubFactors = new List<string>
                    {
                        "range (variety = level of frequency)",
                        "style & collocation",
                        "errors (slips vs errors)",
                        "accuracy"
                    },
                    Descriptors = new Dictionary<string, string>
                    {
                        ["10"] = "Uses a wide range (5000 most popular words) of vocabulary including less common lexis; uses vocabulary precisely (fit context: appropriate meaning, tone, style) and flexibly (ability to adapt); shows full control (90% accurate & conveys intended meaning) of style and collocation; errors (systematic: word choice, spelling, word formation) are very rare with just one or two minor slips (non-systematic) + accuracy",
                        ["9"]  = "Uses a wide range of vocabulary including less common lexis precisely; shows good control (80% accurate) of style and collocation, but there may be some inaccuracies; errors, if present, are non-systematic and non-impeding",
                        ["8"]  = "Uses a good range (4000 most popular words) of vocabulary including some less common lexis appropriately (fit the context); shows limited control (70% accurate) of style and collocation; errors, if present, are non-systematic and non-impeding",
                        ["7"]  = "Uses a sufficient range (3000 most popular words); attempts less common lexis with occasional inappropriacies (grammatically correct, wrong word/choice); errors do not impede (cause strain to understand) communication",
                        ["6"]  = "Uses a sufficient range (3000 most popular words); attempts less common lexis but most are faulty (grammatically and semantically incorrect); errors do not impede communication",
                        ["5"]  = "Uses an adequate range (2000 most popular words) of vocabulary but tends to overuse certain lexical items; errors occur and may impede comprehension at times",
                        ["4"]  = "Uses basic vocabulary with acceptable control (60% correct word choice); errors are noticeable (30%) and impede comprehension",
                        ["3"]  = "Uses a limited range (50%) of basic vocabulary; errors are frequent and distort the meaning (intended meaning changed)",
                        ["2"]  = "Uses a very limited range of words and phrases; errors are dominant (>50%) and distort the meaning",
                        ["1"]  = "Uses only a few isolated words",
                        ["0"]  = "Does not write any words"
                    }
                },
                ["grammar"] = new RubricCriterionModel
                {
                    Weight = 1,
                    SubFactors = new List<string>
                    {
                        "range (variety and difficulty level)",
                        "accuracy"
                    },
                    Descriptors = new Dictionary<string, string>
                    {
                        ["10"] = "Uses a wide range (variety and difficulty level) of structures precisely and flexibly; errors are very rare with just one or two minor slips",
                        ["9"]  = "Uses a wide range of simple and complex structures precisely; the vast majority (80-90%) of the sentences are error-free; errors, if present, are non-systematic and non-impeding",
                        ["8"]  = "Uses a variety of simple and complex structures with good control (70% accuracy, simple > complex) with good control (70% accuracy); the majority (70%) of the sentences are error-free; errors, if present, are non-systematic and non-impeding",
                        ["7"]  = "Uses both simple and complex (passive, tense contrasts, subordination, relative clauses...) structures in a relatively effective way (balanced); errors occur but they rarely lead to misunderstanding",
                        ["6"]  = "Uses both simple and complex structures; errors occur but they rarely lead to misunderstanding",
                        ["5"]  = "Shows good control (70%) of simple structures; attempts complex structures but most are faulty; errors occur, but normally they do not impede comprehension",
                        ["4"]  = "Shows acceptable control (60%) of simple structures; attempts some complex structures, but handles them unsuccessfully",
                        ["3"]  = "Uses some simple structures correctly; frequently makes basic errors that distort the meaning",
                        ["2"]  = "Can only use some memorized structures; errors are dominant and distort the meaning",
                        ["1"]  = "Cannot use sentence forms at all",
                        ["0"]  = "Does not write any words"
                    }
                }
            }
        };

        // ── Task 2 Rubric Builder ─────────────────────────────────────────────

        private RubricModel BuildTask2Rubric() => new RubricModel
        {
            RubricId = "vstep_task2",
            TaskType = "task2",
            Name     = "VSTEP Writing Rating Scale - Task 2",
            Source   = "ULIS-VNU",
            Scale    = new RubricScaleModel { Min = 0, Max = 10, Step = 1 },
            Criteria = new Dictionary<string, RubricCriterionModel>
            {
                ["taskFulfilment"] = new RubricCriterionModel
                {
                    Weight = 1,
                    SubFactors = new List<string>
                    {
                        "requirements (format, length, topic)",
                        "position (thesis statement)",
                        "main points"
                    },
                    Descriptors = new Dictionary<string, string>
                    {
                        ["10"] = "Covers all the requirements of the task sufficiently and effectively; presents a fully-developed (well & convincingly) response with relevant, extended and well-supported ideas",
                        ["9"]  = "Covers all the requirements of the task sufficiently and effectively; presents a well-developed response with relevant, extended and well-supported ideas",
                        ["8"]  = "Covers all the requirements of the task; presents a generally clear position throughout the response; develops main ideas (topic sentence of each body paragraph) with most of the details relevant",
                        ["7"]  = "Covers all the requirements of the task; presents a generally clear position, but in some parts the conclusions may be repeated or unclear; presents relevant main ideas but one or two ideas may be not fully-developed",
                        ["6"]  = "Covers almost all (lack 10-15% words) the requirements of the task; presents a generally clear position, but in some parts the conclusions may be repeated or unclear; presents relevant main ideas but some may not be fully-developed or unclear",
                        ["5"]  = "Partially (lack 20-25% words) covers the requirements of the task; presents a position but it is not always clear throughout the response; there may be no conclusion to the response; presents some main ideas, but they are not fully-developed and there may be some irrelevant details",
                        ["4"]  = "Partially (lack >25% words) covers the requirements of the task; presents a position but it is not always clear throughout the response; there may be no conclusions; present some main ideas, but they may be repetitive and are not sufficiently developed with relevant details",
                        ["3"]  = "Does not adequately address any part of the task, which may have been completely misunderstood; does not present a position; presents limited ideas which are largely undeveloped",
                        ["2"]  = "Barely responds to the task; does not present a position; presents one or two ideas which are not developed",
                        ["1"]  = "Answer is totally irrelevant or incomprehensible",
                        ["0"]  = "Does not attend the exam"
                    }
                },
                ["organization"] = new RubricCriterionModel
                {
                    Weight = 1,
                    SubFactors = new List<string>
                    {
                        "ideas & info unified and well-developed",
                        "paragraphing (main + supporting ideas)"
                    },
                    Descriptors = new Dictionary<string, string>
                    {
                        ["10"] = "Organizes information and ideas clearly; uses a variety as well as a range of cohesive devices and organizational patterns flexibly; uses paragraphing sufficiently and appropriately (well organized and developed)",
                        ["9"]  = "Organizes information and ideas coherently; uses a variety as well as a range of cohesive devices and organizational patterns effectively; uses paragraphing sufficiently and appropriately",
                        ["8"]  = "Organizes information and ideas coherently; uses a range of linking words and cohesive devices appropriately, though there may be some under/over use; uses paragraphing quite well",
                        ["7"]  = "Organizes information and ideas coherently; uses a variety of linking words and a number of cohesive devices accurately, but there may be occasional inappropriacies; manages paragraphing well",
                        ["6"]  = "Organizes information and ideas generally coherently; uses linking words and a limited number of cohesive devices across sentences accurately, but there may be some inappropriacies; manages paragraphing relatively well",
                        ["5"]  = "Organizes information and ideas fairly coherently; uses linking words and some familiar cohesive devices within and across sentences accurately though there may be inaccuracies; may not write in paragraphs, or paragraphing is not adequate",
                        ["4"]  = "Presents information and ideas with some organization; uses linking words accurately and attempts a few familiar cohesive devices within and across sentences, though there may be repetitions or inaccuracies; may not write in paragraphs, or paragraphing is confusing",
                        ["3"]  = "Presents information and ideas in a series of simple sentences linked by only basic, high-frequency linking words",
                        ["2"]  = "Has very little control of organizational features",
                        ["1"]  = "Has no organizational features",
                        ["0"]  = "Does not write any words"
                    }
                },
                ["vocabulary"] = new RubricCriterionModel
                {
                    Weight = 1,
                    SubFactors = new List<string>
                    {
                        "range",
                        "style & collocation",
                        "errors"
                    },
                    Descriptors = new Dictionary<string, string>
                    {
                        ["10"] = "Uses a wide range of vocabulary including less common lexis precisely and flexibly; shows full control of style and collocation, but there may be occasional inappropriacies; errors are very rare with just one or two minor slips",
                        ["9"]  = "Uses a wide range of vocabulary including less common lexis precisely; shows good control of style and collocation, but there may be some inaccuracies; errors, if present, are non-systematic and non-impeding",
                        ["8"]  = "Uses a good range of vocabulary including some less common lexis appropriately; shows good control of style and collocation; errors, if present, are non-systematic and non-impeding",
                        ["7"]  = "Uses a sufficient range of vocabulary; attempts less common lexis with occasional inappropriacies; errors do not impede communication",
                        ["6"]  = "Uses a sufficient range of vocabulary; attempts less common lexis but most are faulty; errors do not impede communication",
                        ["5"]  = "Uses an adequate range of vocabulary but tends to overuse certain lexical items; errors occur and may impede comprehension at times",
                        ["4"]  = "Uses basic vocabulary with acceptable control; errors are noticeable and impede comprehension at times",
                        ["3"]  = "Uses a limited range of basic vocabulary; errors are frequent and distort the meaning",
                        ["2"]  = "Uses a very limited range of words and phrases; errors are dominant and distort the meaning",
                        ["1"]  = "Uses only a few isolated words",
                        ["0"]  = "Does not write any words"
                    }
                },
                ["grammar"] = new RubricCriterionModel
                {
                    Weight = 1,
                    SubFactors = new List<string>
                    {
                        "range",
                        "accuracy"
                    },
                    Descriptors = new Dictionary<string, string>
                    {
                        ["10"] = "Uses a wide range of structures precisely and flexibly; errors are very rare",
                        ["9"]  = "Uses a wide range of simple and complex structures precisely; vast majority of sentences are error-free; errors are non-systematic and non-impeding",
                        ["8"]  = "Uses a variety of simple and complex structures with good control; the majority of sentences are error-free; errors are non-systematic and non-impeding",
                        ["7"]  = "Uses both simple and complex structures in a relatively effective way; errors occur but rarely lead to misunderstanding",
                        ["6"]  = "Uses both simple and complex structures; errors occur but rarely lead to misunderstanding",
                        ["5"]  = "Shows good control of simple structures; attempts complex structures but most are faulty; errors occur but normally do not impede comprehension",
                        ["4"]  = "Shows acceptable control of simple structures; attempts some complex structures but errors occur frequently and impede comprehension at times",
                        ["3"]  = "Uses some simple structures correctly; frequently makes basic errors that distort the meaning",
                        ["2"]  = "Can only use some memorized structures; errors are dominant and distort the meaning",
                        ["1"]  = "Cannot use sentence forms at all",
                        ["0"]  = "Does not write any words"
                    }
                }
            }
        };
    }
}
