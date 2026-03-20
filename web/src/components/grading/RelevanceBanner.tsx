// @ts-nocheck
'use client';

import { TaskRelevanceResult } from '@/types/grading';
import { CheckCircle, XCircle } from 'lucide-react';

interface RelevanceBannerProps {
  relevance: TaskRelevanceResult;
}

export function RelevanceBanner({ relevance }: RelevanceBannerProps) {
  const { isRelevant, relevanceScore, verdictVi, missingPointsVi, offTopicSentencesEn } =
    relevance;

  if (isRelevant) {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-emerald-800">
        <CheckCircle className="h-5 w-5 flex-shrink-0 text-emerald-600" />
        <span className="text-sm font-medium">
          Bài viết bám đề —{' '}
          <span className="font-bold">{relevanceScore}/10</span>
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-800 space-y-2">
      <div className="flex items-start gap-3">
        <XCircle className="h-5 w-5 flex-shrink-0 text-red-500 mt-0.5" />
        <div>
          <p className="text-sm font-semibold">Lạc đề — {verdictVi}</p>
          <p className="text-xs text-red-600 mt-0.5">
            Điểm liên quan: {relevanceScore}/10
          </p>
        </div>
      </div>

      {missingPointsVi.length > 0 && (
        <div className="ml-8">
          <p className="text-xs font-semibold text-red-700 mb-1">Thiếu luận điểm:</p>
          <ul className="list-disc list-inside space-y-0.5">
            {missingPointsVi.map((point, i) => (
              <li key={i} className="text-xs text-red-700">
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}

      {offTopicSentencesEn.length > 0 && (
        <div className="ml-8">
          <p className="text-xs font-semibold text-red-700 mb-1">Câu lạc đề:</p>
          {offTopicSentencesEn.map((sentence, i) => (
            <p key={i} className="text-xs italic text-red-600 border-l-2 border-red-300 pl-2 mb-1">
              &ldquo;{sentence}&rdquo;
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
