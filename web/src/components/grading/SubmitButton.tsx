'use client';

import { Loader2 } from 'lucide-react';

interface SubmitButtonProps {
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}

export function SubmitButton({ loading, disabled, onClick }: SubmitButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      id="submit-essay-btn"
      className={`flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3 rounded-xl font-semibold text-sm transition-all duration-150 ${
        isDisabled
          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
          : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white shadow-md hover:shadow-lg'
      }`}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Đang chấm điểm...</span>
        </>
      ) : (
        'Nộp bài & Chấm điểm'
      )}
    </button>
  );
}
