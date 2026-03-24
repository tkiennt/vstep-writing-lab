import { Annotation, SentenceFeedback, AnnotationType, AnnotationSeverity, GradingResultDoc } from '@/types/grading';
import { Timestamp } from 'firebase/firestore';

/**
 * Maps raw backend feedback into a flattened array of Annotations for the AnnotatedEssay component.
 */
export function mapFeedbackToAnnotations(
  essayText: string,
  sentenceFeedback: SentenceFeedback[] = [],
  inlineHighlights: InlineHighlight[] = []
): Annotation[] {
  const annotations: Annotation[] = [];

  // 1. Map Sentence Feedback (finding indices by verbatim text)
  sentenceFeedback.forEach((s) => {
    let startIndex = essayText.indexOf(s.sentence);
    if (startIndex >= 0) {
      annotations.push({
        startIndex,
        endIndex: startIndex + s.sentence.length,
        type: 'sentence',
        message: s.explanation,
        suggestion: s.suggestion || null,
        severity: s.isGood ? 'good' : 'warning',
        isSentence: true
      });
    }
  });

  // 2. Map Inline Highlights (using quotes or verbatim segments)
  inlineHighlights.forEach((h: any) => {
    // Some highlights might use 'quote', others 'text', 'original', etc.
    const quote = h.text || h.Text || h.quote || h.original || '';
    if (!quote) return;

    let startIndex = essayText.indexOf(quote);
    if (startIndex >= 0) {
      const type: AnnotationType = h.type === 'strength' ? 'strength' : (h.category as AnnotationType || 'grammar');
      const severity: AnnotationSeverity = h.type === 'strength' ? 'good' : 'error';

      annotations.push({
        startIndex,
        endIndex: startIndex + quote.length,
        type,
        message: h.issueVi || h.issue || 'Cần chú ý',
        suggestion: h.fix || h.correction || null,
        severity
      });
    }
  });

  // Sort by severity (error > warning > info > good) to help UI prioritize overlapping highlights
  const severityPriority: Record<AnnotationSeverity, number> = {
    error: 4,
    warning: 3,
    info: 2,
    good: 1
  };

  return annotations.sort((a, b) => severityPriority[b.severity] - severityPriority[a.severity]);
}

/**
 * Centralized mapper to convert raw result data (from Firestore or API) into a unified UI document.
 * Handles casing differences (PascalCase from Firestore vs camelCase from API).
 */
export function mapRawToGradingResultDoc(raw: any, essayId: string): GradingResultDoc {
  // 1. Resolve basic fields with fallback for casing
  const id          = raw.id || raw.Id || essayId;
  const submissionId = raw.submissionId || raw.SubmissionId || id;
  const userUid    = raw.userId || raw.studentId || raw.UserId || raw.StudentId || '';
  const promptId   = raw.questionId || raw.examId || raw.promptId || raw.QuestionId || raw.ExamId || '';
  const questionTitle = raw.questionTitle || raw.QuestionTitle || '';
  const essayText  = raw.essayContent || raw.EssayContent || raw.essayText || raw.EssayText || '';
  const wordCount  = raw.wordCount || raw.WordCount || 0;
  const cefrLevel  = raw.cefrLevel || raw.CefrLevel || 'B1';
  const totalScore = raw.totalScore || raw.TotalScore || raw.aiScore?.overall || 0;
  const taskType   = (raw.taskType || raw.TaskType || 'task1').toLowerCase().includes('1') ? 'task1' : 'task2';
  
  // Dates
  let createdAt = raw.createdAt || raw.gradedAt || raw.GradedAt || raw.CreatedAt || new Date();
  if (createdAt instanceof Timestamp) createdAt = createdAt.toDate();
  else if (typeof createdAt === 'string') createdAt = new Date(createdAt);
 
  // 2. Resolve Criteria/Score Objects
  const apiScore = raw.score || raw.Score || raw.aiScore || raw.AiScore || {};
  const apiFeedback = raw.aiFeedback || raw.AiFeedback || {};
  
  const tf = raw.taskFulfilment || raw.TaskFulfilment || apiScore.taskFulfilment || apiScore.TaskFulfilment || {};
  const org = raw.organization || raw.Organization || apiScore.organization || apiScore.Organization || {};
  const voc = raw.vocabulary || raw.Vocabulary || apiScore.vocabulary || apiScore.Vocabulary || {};
  const gra = raw.grammar || raw.Grammar || apiScore.grammar || apiScore.Grammar || {};
  const rel = raw.relevance || raw.Relevance || { isRelevant: true, relevanceScore: 10 };
 
  // 3. Map Annotations (including sentence-level analysis)
  const finalAnnotations = mapFeedbackToAnnotations(
    essayText,
    raw.sentenceFeedback || raw.SentenceFeedback || apiFeedback.sentenceFeedback || [],
    raw.inlineHighlights || raw.InlineHighlights || raw.corrections || raw.Corrections || apiFeedback.highlights || apiFeedback.Highlights || []
  );
 
  // 4. Final Unified Structure
  const mapped: GradingResultDoc = {
    id,
    submissionId,
    userUid,
    promptId,
    questionTitle,
    essayText,
    wordCount,
    cefrLevel,
    createdAt,
    gradedAt: createdAt,
    totalScore: totalScore || apiScore.overall || apiScore.Overall || 0,
    taskType,
    isRelevant: rel.isRelevant ?? true,
    score: {
      taskFulfilment: tf.score ?? tf.Score ?? (typeof tf === 'number' ? tf : 0),
      organization:   org.score ?? org.Score ?? (typeof org === 'number' ? org : 0),
      vocabulary:     voc.score ?? voc.Score ?? (typeof voc === 'number' ? voc : 0),
      grammar:        gra.score ?? gra.Score ?? (typeof gra === 'number' ? gra : 0),
      overall:        totalScore || apiScore.overall || apiScore.Overall || 0
    },
    summary: raw.summary || raw.Summary || apiFeedback.summary || apiFeedback.Summary || "Kết quả phân tích bài viết",
    suggestions: raw.improvementsVi || raw.ImprovementsVi || apiFeedback.suggestions || apiFeedback.Suggestions || [],
    annotations: finalAnnotations,
    sentenceAnalysis: [],
    taskRelevance: {
      isRelevant: rel.isRelevant ?? true,
      relevanceScore: rel.relevanceScore || rel.Score || 0,
      verdictVi: rel.verdictVi || rel.VerdictVi || '',
      missingPointsVi: rel.missingPointsVi || rel.MissingPointsVi || [],
      offTopicSentencesEn: rel.offTopicSentences || rel.OffTopicSentences || []
    },
    sentenceFeedback: raw.sentenceFeedback || raw.SentenceFeedback || apiFeedback.sentenceFeedback || [],
    improvementTracking: raw.improvementTracking || raw.ImprovementTracking,
    guideMode: raw.guideMode || raw.GuideMode,
    suggestedStructures: (raw.recommendedStructures || raw.RecommendedStructures || []).map((s: any) => ({
      structure: s.structure_name || s.structureName || s.StructureName,
      example: s.example || s.Example,
      usageTip: s.why_use_it_vi || s.whyUseItVi || s.WhyUseItVi || s.UsageTip
    })),
    roadmap: (raw.roadmap || raw.Roadmap || apiFeedback.roadmap) ? {
      currentCefr: raw.roadmap?.currentLevel || raw.Roadmap?.CurrentLevel || apiFeedback.roadmap?.currentLevel || raw.roadmap?.currentCefr,
      targetCefr: raw.roadmap?.targetLevel || raw.Roadmap?.TargetLevel || apiFeedback.roadmap?.targetLevel || raw.roadmap?.targetCefr,
      estimatedWeeks: raw.roadmap?.estimatedWeeks || raw.Roadmap?.EstimatedWeeks || apiFeedback.roadmap?.estimatedWeeks,
      weekly_plan: raw.roadmap?.weeklyPlan || raw.Roadmap?.WeeklyPlan || raw.roadmap?.weekly_plan || apiFeedback.roadmap?.weeklyPlan
    } : undefined,
    mode: (raw.mode || raw.Mode || 'exam') as any,
    status: raw.status || raw.Status || (raw.id ? 'scored' : 'pending'),
  };

  return mapped;
}

// Support types for older/other highlights if they exist
export interface InlineHighlight {
  type?: 'error' | 'strength' | string;
  original?: string;
  quote?: string;
  issue?: string;
  issueVi?: string;
  fix?: string;
  correction?: string;
  category?: string;
  index?: number;
  length?: number;
}
