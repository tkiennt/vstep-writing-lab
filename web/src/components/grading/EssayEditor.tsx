'use client';

import { MIN_WORD_COUNT } from '@/types/grading';

interface EssayEditorProps {
  taskType: 'task1' | 'task2';
  value: string;
  onChange: (text: string) => void;
  disabled?: boolean;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function EssayEditor({ taskType, value, onChange, disabled = false }: EssayEditorProps) {
  const wordCount = countWords(value);
  const minWords = MIN_WORD_COUNT[taskType];
  const meetsMinimum = wordCount >= minWords;

  return (
    <div className="space-y-2">
      <label htmlFor="essay-textarea" className="text-lg font-semibold text-gray-800">
        Bài viết của bạn
      </label>

      <textarea
        id="essay-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Bắt đầu viết bài của bạn ở đây…"
        className={`w-full rounded-xl border-2 p-4 text-sm text-gray-800 leading-relaxed resize-y transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
          disabled
            ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-white border-gray-200 hover:border-gray-300 focus:border-indigo-400'
        }`}
        style={{ minHeight: 200 }}
        rows={10}
      />

      {/* Word counter */}
      <div className="flex items-center justify-between">
        <p
          className={`text-sm font-medium tabular-nums ${
            meetsMinimum ? 'text-emerald-600' : 'text-red-500'
          }`}
        >
          {wordCount} / {minWords} từ
        </p>
        {!meetsMinimum && value.trim().length > 0 && (
          <p className="text-xs text-red-400">
            Cần thêm {minWords - wordCount} từ nữa để đạt yêu cầu tối thiểu.
          </p>
        )}
      </div>
    </div>
  );
}

// Also export the helper so parent can reuse
export { countWords };
