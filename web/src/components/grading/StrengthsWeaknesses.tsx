// @ts-nocheck
'use client';

import { GradingResult } from '@/types/grading';
import { TrendingUp, AlertCircle } from 'lucide-react';

interface StrengthsWeaknessesProps {
  result: GradingResult;
}

export function StrengthsWeaknesses({ result }: StrengthsWeaknessesProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Strengths */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-4 w-4 text-emerald-600" />
          <h4 className="text-sm font-semibold text-emerald-800">Điểm mạnh</h4>
        </div>
        {result.strengthsVi.length > 0 ? (
          <ul className="space-y-1.5">
            {result.strengthsVi.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-emerald-700">
                <span className="mt-0.5 text-emerald-500 flex-shrink-0">✓</span>
                {s}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-emerald-600 italic">Chưa xác định điểm mạnh.</p>
        )}
      </div>

      {/* Improvements */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <h4 className="text-sm font-semibold text-amber-800">Cần cải thiện</h4>
        </div>
        {result.improvementsVi.length > 0 ? (
          <ul className="space-y-1.5">
            {result.improvementsVi.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-amber-700">
                <span className="mt-0.5 text-amber-500 flex-shrink-0">→</span>
                {s}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-amber-600 italic">Không có phản hồi cải thiện.</p>
        )}
      </div>
    </div>
  );
}
