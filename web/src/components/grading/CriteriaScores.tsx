// @ts-nocheck
'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { GradingResult, CRITERION_LABELS, CriterionKey } from '@/types/grading';

interface CriteriaScoresProps {
  result: GradingResult;
}

function scoreColor(score: number): string {
  if (score >= 8) return 'bg-emerald-500';
  if (score >= 6) return 'bg-indigo-500';
  if (score >= 4) return 'bg-amber-400';
  return 'bg-red-500';
}

const CRITERIA: CriterionKey[] = ['taskFulfilment', 'organization', 'vocabulary', 'grammar'];

export function CriteriaScores({ result }: CriteriaScoresProps) {
  const [expanded, setExpanded] = useState<CriterionKey | null>(null);

  const toggle = (key: CriterionKey) =>
    setExpanded((prev) => (prev === key ? null : key));

  return (
    <div className="space-y-2">
      <h3 className="text-base font-semibold text-gray-800">Điểm theo tiêu chí</h3>
      {CRITERIA.map((key) => {
        const criterion = result[key];
        const isOpen = expanded === key;
        const widthPct = `${(criterion.score / 10) * 100}%`;

        return (
          <div key={key} className="rounded-xl border border-gray-100 overflow-hidden">
            {/* Row — click to expand */}
            <button
              type="button"
              onClick={() => toggle(key)}
              className="flex items-center gap-3 w-full px-4 py-3 bg-white hover:bg-gray-50 transition-colors text-left"
              aria-expanded={isOpen}
            >
              {/* Criterion name */}
              <span className="text-sm text-gray-700 w-44 flex-shrink-0">
                {CRITERION_LABELS[key]}
              </span>

              {/* Progress bar */}
              <span className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                <span
                  className={`block h-full rounded-full transition-all duration-500 ${scoreColor(criterion.score)}`}
                  style={{ width: widthPct }}
                />
              </span>

              {/* Score */}
              <span className="text-sm font-bold tabular-nums w-12 text-right text-gray-800">
                {criterion.score}/10
              </span>

              {/* Band label */}
              <span className="hidden sm:block text-xs text-gray-500 w-28 text-right">
                {criterion.bandLabel}
              </span>

              <ChevronDown
                className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Expandable feedback */}
            {isOpen && (
              <div className="px-4 pb-4 bg-gray-50 border-t border-gray-100 space-y-2">
                <p className="text-sm text-gray-700 mt-3">
                  <span className="font-semibold">Nhận xét: </span>
                  {criterion.feedbackVi}
                </p>
                {criterion.evidenceEn && (
                  <p className="text-xs text-gray-500 italic border-l-2 border-indigo-300 pl-2">
                    Evidence: &ldquo;{criterion.evidenceEn}&rdquo;
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
