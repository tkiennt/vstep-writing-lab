'use client';

import { GradingResult } from '@/types/grading';

interface CorrectionsListProps {
  result: GradingResult;
}

export function CorrectionsList({ result }: CorrectionsListProps) {
  if (result.corrections.length === 0) {
    return (
      <div className="text-sm text-gray-400 italic p-4 text-center">
        Không có lỗi ngữ pháp/từ vựng cụ thể cần sửa.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-gray-800">Sửa lỗi cụ thể</h3>
      {result.corrections.map((c, i) => (
        <div
          key={i}
          className="rounded-xl border border-gray-100 bg-white p-4 space-y-1.5 shadow-xs"
        >
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded bg-red-100 px-2 py-0.5 text-red-700 line-through font-mono">
              {c.original}
            </span>
            <span className="text-gray-400">→</span>
            <span className="rounded bg-emerald-100 px-2 py-0.5 text-emerald-700 font-mono font-medium">
              {c.corrected}
            </span>
          </div>
          <p className="text-xs text-gray-500">{c.reasonVi}</p>
        </div>
      ))}
    </div>
  );
}
