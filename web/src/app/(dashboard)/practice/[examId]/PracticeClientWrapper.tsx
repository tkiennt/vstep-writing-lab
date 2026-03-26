'use client';

import React, { useEffect, useState } from 'react';
import { getExamPrompt } from '@/lib/firestore';
import { ExamPrompt } from '@/types/grading';
import { PracticeClient } from './PracticeClient';
import { Loader2 } from 'lucide-react';
import { notFound } from 'next/navigation';

export default function PracticeClientWrapper({ examId }: { examId: string }) {
  const [exam, setExam] = useState<ExamPrompt | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getExamPrompt(examId).then(data => {
      setExam(data);
      setLoading(false);
    }).catch(err => {
      console.error('Failed to load exam', err);
      setLoading(false);
    });
  }, [examId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!exam) {
    return notFound();
  }

  return <PracticeClient exam={exam} />;
}
