export const dynamic = 'force-dynamic';
import { getExamPrompt } from '@/lib/firestore';
import { notFound } from 'next/navigation';
import { PracticeClient } from './PracticeClient';
import { ExamPrompt } from '@/types/grading';

interface PageProps {
  params: {
    examId: string;
  };
}

// Next.js Server Component
export default async function PracticePage({ params }: PageProps) {
  const { examId } = params;
  
  // Await the fetch
  const exam = await getExamPrompt(examId);

  // Fallback if the examId is invalid
  if (!exam) {
    notFound();
  }

  return <PracticeClient exam={exam} />;
}
