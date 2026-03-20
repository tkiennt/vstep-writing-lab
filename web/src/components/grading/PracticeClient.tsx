// @ts-nocheck
'use client';

import { useState, useCallback } from 'react';
import { ExamPrompt, GradingResult, MIN_WORD_COUNT } from '@/types/grading';
import { gradeEssay, ApiError } from '@/lib/api';
import { ExamSelector } from './ExamSelector';
import { EssayEditor, countWords } from './EssayEditor';
import { SubmitButton } from './SubmitButton';
import { GradingResultPanel, GradingResultSkeleton } from './GradingResultPanel';
import { useGradingAuth } from '@/hooks/useGradingAuth';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface PracticeClientProps {
  initialPrompts: ExamPrompt[];
}

export function PracticeClient({ initialPrompts }: PracticeClientProps) {
  const { user } = useGradingAuth();

  const [selectedPrompt, setSelectedPrompt] = useState<ExamPrompt | null>(null);
  const [essayText, setEssayText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GradingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const wordCount = countWords(essayText);
  const minWords = selectedPrompt ? MIN_WORD_COUNT[selectedPrompt.taskType] : 120;
  const canSubmit = !!selectedPrompt && wordCount >= minWords && !!user;

  const handleSubmit = useCallback(async () => {
    if (!selectedPrompt || !user) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await gradeEssay({
        essayId: `${user.uid}_${Date.now()}`,
        taskType: selectedPrompt.taskType,
        prompt: selectedPrompt.instruction,
        essayText,
        wordCount,
        studentId: user.uid,
      });
      setResult(res);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`Lỗi ${err.status}: ${err.message}`);
      } else {
        setError('Không thể kết nối đến máy chủ. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  }, [selectedPrompt, user, essayText, wordCount]);

  const handleRetry = () => {
    setError(null);
    handleSubmit();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 px-4 py-6">
      {/* Heading */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Luyện viết VSTEP</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Chọn đề bài, viết bài, nộp để nhận phản hồi chi tiết từ AI.
        </p>
      </div>

      {/* Step 1 — Exam selector */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <ExamSelector
          prompts={initialPrompts}
          selected={selectedPrompt}
          onSelect={(p) => {
            setSelectedPrompt(p);
            setResult(null);
            setError(null);
          }}
        />
      </section>

      {/* Step 2 — Essay editor */}
      {selectedPrompt && (
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <EssayEditor
            taskType={selectedPrompt.taskType}
            value={essayText}
            onChange={setEssayText}
            disabled={loading}
          />

          {/* Submit row */}
          <div className="flex items-center gap-4">
            <SubmitButton
              loading={loading}
              disabled={!canSubmit}
              onClick={handleSubmit}
            />
            {!user && (
              <p className="text-xs text-gray-400">
                Đăng nhập để nộp bài.
              </p>
            )}
          </div>
        </section>
      )}

      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-700">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">{error}</div>
          <button
            type="button"
            onClick={handleRetry}
            className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 underline"
          >
            <RefreshCw className="h-3 w-3" />
            Thử lại
          </button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && <GradingResultSkeleton />}

      {/* Result */}
      {!loading && result && <GradingResultPanel result={result} />}
    </div>
  );
}
