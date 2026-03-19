'use client';

import { GradingResult } from '@/types/grading';
import { ScoreSummary } from './ScoreSummary';
import { RelevanceBanner } from './RelevanceBanner';
import { CriteriaScores } from './CriteriaScores';
import { StrengthsWeaknesses } from './StrengthsWeaknesses';
import { CorrectionsList } from './CorrectionsList';

// ── Skeleton ─────────────────────────────────────────────────
function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-gray-100 ${className ?? ''}`} />
  );
}

export function GradingResultSkeleton() {
  return (
    <div className="space-y-4 mt-6">
      <p className="flex items-center gap-2 text-sm text-indigo-600 font-medium">
        <span className="inline-block h-4 w-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        Đang chấm điểm… (~10 giây)
      </p>
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-48 w-full" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

// ── Main Panel ───────────────────────────────────────────────
interface GradingResultPanelProps {
  result: GradingResult;
}

export function GradingResultPanel({ result }: GradingResultPanelProps) {
  return (
    <div className="space-y-6 mt-6 animate-fade-in">
      <ScoreSummary result={result} />
      <RelevanceBanner relevance={result.taskRelevance} />
      <CriteriaScores result={result} />
      <StrengthsWeaknesses result={result} />
      <CorrectionsList result={result} />
    </div>
  );
}
