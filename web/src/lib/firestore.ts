/**
 * lib/firestore.ts
 * Frontend Firestore read helpers — used directly from client components.
 * All reads are behind auth; always apply limit() to avoid unbounded queries.
 */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  onSnapshot,
  where,
  Unsubscribe,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ProgressSummary, GradingResultDoc } from '@/types/grading';

// ── Internal converters ──────────────────────────────────────

function toDate(value: unknown): Date {
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  if (typeof value === 'string') return new Date(value);
  return new Date();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function docToGradingResult(id: string, data: Record<string, any>): GradingResultDoc {
  return {
    docId: id,
    essayId: data.essayId ?? id,
    taskType: data.taskType ?? 'task2',
    studentId: data.studentId ?? '',
    examId: data.examId ?? '',
    gradedAt: toDate(data.gradedAt),
    essayText: data.essayText ?? '',
    wordCount: data.wordCount ?? 0,
    aiModel: data.aiModel ?? '',
    isRelevant: data.isRelevant ?? false,
    relevanceScore: data.relevanceScore ?? 0,
    verdictVi: data.verdictVi ?? '',
    missingPointsVi: data.missingPointsVi ?? [],
    offTopicSentences: data.offTopicSentences ?? [],
    taskFulfilmentScore: data.taskFulfilment ?? 0,
    organizationScore: data.organization ?? 0,
    vocabularyScore: data.vocabulary ?? 0,
    grammarScore: data.grammar ?? 0,
    totalScore: data.totalScore ?? 0,
    cefrLevel: data.cefrLevel ?? '',
    vstepComparison: data.vstepComparison ?? '',
    strengthsVi: data.strengthsVi ?? [],
    improvementsVi: data.improvementsVi ?? [],
    corrections: data.corrections ?? [],
    taskRelevance: data.taskRelevance ?? {
      isRelevant: data.isRelevant ?? false,
      relevanceScore: data.relevanceScore ?? 0,
      verdictVi: data.verdictVi ?? '',
      missingPointsVi: data.missingPointsVi ?? [],
      offTopicSentencesEn: data.offTopicSentences ?? [],
    },
    taskFulfilment: data.feedbackByCategory?.taskFulfilment ?? {
      score: data.taskFulfilment ?? 0,
      bandLabel: 'Đạt yêu cầu',
      feedbackEn: '',
      feedbackVi: '',
      evidenceEn: '',
    },
    organization: data.feedbackByCategory?.organization ?? {
      score: data.organization ?? 0,
      bandLabel: 'Đạt yêu cầu',
      feedbackEn: '',
      feedbackVi: '',
      evidenceEn: '',
    },
    vocabulary: data.feedbackByCategory?.vocabulary ?? {
      score: data.vocabulary ?? 0,
      bandLabel: 'Đạt yêu cầu',
      feedbackEn: '',
      feedbackVi: '',
      evidenceEn: '',
    },
    grammar: data.feedbackByCategory?.grammar ?? {
      score: data.grammar ?? 0,
      bandLabel: 'Đạt yêu cầu',
      feedbackEn: '',
      feedbackVi: '',
      evidenceEn: '',
    },
    feedbackByCategory: data.feedbackByCategory ?? {
      taskFulfilment: { score: 0, bandLabel: 'Đạt yêu cầu', feedbackEn: '', feedbackVi: '', evidenceEn: '' },
      organization:   { score: 0, bandLabel: 'Đạt yêu cầu', feedbackEn: '', feedbackVi: '', evidenceEn: '' },
      vocabulary:     { score: 0, bandLabel: 'Đạt yêu cầu', feedbackEn: '', feedbackVi: '', evidenceEn: '' },
      grammar:        { score: 0, bandLabel: 'Đạt yêu cầu', feedbackEn: '', feedbackVi: '', evidenceEn: '' },
    },
  };
}

// ── Public helpers ───────────────────────────────────────────

/**
 * One-time read of a user's progress summary.
 * Returns null if the document doesn't exist yet.
 */
export async function getProgressSummary(
  uid: string
): Promise<ProgressSummary | null> {
  const ref = doc(db, 'users', uid, 'progress', 'summary');
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d = snap.data() as Record<string, any>;
  return {
    totalSubmissions: d.totalSubmissions ?? 0,
    avgScore: d.avgScore ?? 0,
    avgTaskFulfilment: d.avgTaskFulfilment ?? 0,
    avgOrganization: d.avgOrganization ?? 0,
    avgVocabulary: d.avgVocabulary ?? 0,
    avgGrammar: d.avgGrammar ?? 0,
    weakestCriterion: d.weakestCriterion ?? '',
    strongestCriterion: d.strongestCriterion ?? '',
    trend: d.trend ?? 'Stable',
    trendValue: d.trendValue ?? 0,
    currentCefr: d.currentCefr ?? '',
    vstepComparison: d.vstepComparison ?? '',
    relevanceRate: d.relevanceRate ?? 0,
    lastUpdated: toDate(d.lastUpdated),
  };
}

/**
 * One-time fetch of grading history for a user.
 * Always applies limit() — defaults to 10.
 */
export async function getGradingHistory(
  uid: string,
  limitCount = 10
): Promise<GradingResultDoc[]> {
  const col = collection(db, 'grading_results');
  const q = query(
    col,
    where('studentId', '==', uid),
    orderBy('gradedAt', 'desc'),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  if (snap.empty) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return snap.docs.map((d) => docToGradingResult(d.id, d.data() as Record<string, any>));
}

/**
 * Real-time listener on grading_results for a user.
 * Returns the Firestore Unsubscribe function — call it on cleanup.
 */
export function subscribeToHistory(
  uid: string,
  callback: (results: GradingResultDoc[]) => void,
  limitCount = 10
): Unsubscribe {
  const col = collection(db, 'grading_results');
  const q = query(
    col,
    where('studentId', '==', uid),
    orderBy('gradedAt', 'desc'),
    limit(limitCount)
  );

  return onSnapshot(q, (snap) => {
    if (snap.empty) {
      callback([]);
      return;
    }
    const results = snap.docs.map((d) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      docToGradingResult(d.id, d.data() as Record<string, any>)
    );
    callback(results);
  });
}
