'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ResultClient } from '@/components/features/feedback/ResultClient';

export default function ResultPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');

  if (!id) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Không tìm thấy kết quả</h2>
        <p className="text-slate-500 font-medium mt-2">Dường như ID bài kiểm tra không hợp lệ hoặc đã bị xóa.</p>
        <button 
          onClick={() => router.push('/practice-list')}
          className="mt-6 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg hover:-translate-y-0.5 transition-all"
        >
          Trở về trang luyện tập
        </button>
      </div>
    );
  }

  // The existing ResultClient takes an `essayId` prop (which represents the ID from `grading_results` table)
  return <ResultClient essayId={id} />;
}
