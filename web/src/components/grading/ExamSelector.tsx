// @ts-nocheck
'use client';

import { ExamPrompt } from '@/types/grading';

interface ExamSelectorProps {
  prompts: ExamPrompt[];
  selected: ExamPrompt | null;
  onSelect: (prompt: ExamPrompt) => void;
}

const DIFFICULTY_DOTS = ['●', '●', '●'];

const CEFR_COLORS: Record<string, string> = {
  B1: 'bg-blue-100 text-blue-700',
  B2: 'bg-emerald-100 text-emerald-700',
  C1: 'bg-purple-100 text-purple-700',
};

export function ExamSelector({ prompts, selected, onSelect }: ExamSelectorProps) {
  const task1 = prompts.filter((p) => p.taskType === 'task1');
  const task2 = prompts.filter((p) => p.taskType === 'task2');

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">Chọn đề thi</h2>

      {[
        { label: 'Task 1 (≥ 120 từ)', items: task1 },
        { label: 'Task 2 (≥ 250 từ)', items: task2 },
      ].map(({ label, items }) =>
        items.length === 0 ? null : (
          <div key={label}>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              {label}
            </p>
            <div className="grid grid-cols-1 gap-2">
              {items.map((prompt) => {
                const isSelected = selected?.id === prompt.id;
                return (
                  <button
                    key={prompt.id}
                    type="button"
                    onClick={() => onSelect(prompt)}
                    className={`w-full text-left rounded-xl border-2 p-4 transition-all duration-150 ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          CEFR_COLORS[prompt.cefrLevel] ?? 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {prompt.cefrLevel}
                      </span>
                      <span className="text-xs text-gray-400">
                        {DIFFICULTY_DOTS.map((dot, i) => (
                          <span
                            key={i}
                            className={i < prompt.difficulty ? 'text-amber-500' : 'text-gray-200'}
                          >
                            {dot}
                          </span>
                        ))}
                      </span>
                      <span className="ml-auto text-xs text-gray-400 italic">
                        {prompt.topicCategory}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {prompt.instruction.slice(0, 120)}
                      {prompt.instruction.length > 120 ? '…' : ''}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )
      )}

      {/* Full instruction preview */}
      {selected && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900 leading-relaxed">
          <p className="font-semibold mb-1">Đề bài đầy đủ:</p>
          <p>{selected.instruction}</p>
          {selected.keyPoints.length > 0 && (
            <ul className="mt-2 space-y-1 list-disc list-inside text-indigo-800">
              {selected.keyPoints.map((kp, i) => (
                <li key={i}>{kp}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
