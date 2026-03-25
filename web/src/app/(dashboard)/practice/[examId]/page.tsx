export const dynamic = 'force-dynamic';

import React, { Suspense } from 'react';
import { getExamPrompt } from '@/lib/firestore';
import { notFound } from 'next/navigation';
import { PracticeClient } from './PracticeClient';

interface PageProps {
  params: {
    examId: string;
  };
}

// Fixed Server Component for VSTEP Practice
export default async function PracticePage({ params }: PageProps) {
  const { examId } = params;
  
  // Await the fetch
  const exam = await getExamPrompt(examId);

  // Fallback if the examId is invalid
  if (!exam) {
    notFound();
  }

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold text-slate-400">Loading Practice Environment...</div>}>
      <PracticeClient exam={exam} />
    </Suspense>
  );
}
