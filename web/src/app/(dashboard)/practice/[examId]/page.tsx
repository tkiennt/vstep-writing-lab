'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const PracticeClientWrapper = dynamic(() => import('./PracticeClientWrapper'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center font-bold text-slate-400 gap-3">
      <Loader2 className="w-5 h-5 animate-spin" /> Loading Practice Environment...
    </div>
  )
});

export default function PracticePage() {
  const params = useParams() as { examId: string };
  return <PracticeClientWrapper examId={params.examId} />;
}

