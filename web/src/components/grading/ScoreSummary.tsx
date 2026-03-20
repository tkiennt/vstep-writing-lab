// @ts-nocheck
'use client';

import { GradingResult } from '@/types/grading';

interface ScoreSummaryProps {
  result: GradingResult;
}

const CEFR_STYLE: Record<string, string> = {
  B1: 'bg-blue-100 text-blue-800 border border-blue-200',
  B2: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  C1: 'bg-purple-100 text-purple-800 border border-purple-200',
  'C1+': 'bg-violet-100 text-violet-800 border border-violet-200',
};

export function ScoreSummary({ result }: ScoreSummaryProps) {
  const score = result.totalScore;
  const percentage = (score / 10) * 100;

  // Colour based on score
  const ringColor =
    score >= 8
      ? '#22c55e'
      : score >= 6
      ? '#6366f1'
      : score >= 4
      ? '#f59e0b'
      : '#ef4444';

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
      {/* Circular score */}
      <div className="relative flex-shrink-0">
        <svg width={96} height={96} className="-rotate-90">
          <circle cx={48} cy={48} r={40} fill="none" stroke="#f3f4f6" strokeWidth={8} />
          <circle
            cx={48}
            cy={48}
            r={40}
            fill="none"
            stroke={ringColor}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 40}`}
            strokeDashoffset={`${2 * Math.PI * 40 * (1 - percentage / 100)}`}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold tabular-nums" style={{ color: ringColor }}>
            {score.toFixed(1)}
          </span>
          <span className="text-xs text-gray-400">/10</span>
        </div>
      </div>

      {/* Labels */}
      <div className="text-center sm:text-left">
        <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
          <span
            className={`rounded-full px-3 py-1 text-sm font-bold ${
              CEFR_STYLE[result.cefrLevel] ?? 'bg-gray-100 text-gray-700'
            }`}
          >
            {result.cefrLevel}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              result.taskType === 'task1'
                ? 'bg-sky-100 text-sky-700'
                : 'bg-orange-100 text-orange-700'
            }`}
          >
            {result.taskType === 'task1' ? 'Task 1' : 'Task 2'}
          </span>
        </div>
        <p className="mt-2 text-sm text-gray-600 max-w-sm">{result.vstepComparison}</p>
      </div>
    </div>
  );
}
