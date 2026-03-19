import { getExamPrompts } from '@/lib/api';
import { WritingClient } from '@/components/features/writing/WritingClient';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Luyện viết | VSTEP Writing Lab',
};

export default async function WritingPage({ params }: { params: { examId: string } }) {
  const { examId } = params;
  
  try {
    // Assuming getExamPrompts can be used or a GetById exists
    // Using simple fetch to backend for reliability if needed, but getExamPrompts is cleaner
    const prompts = await getExamPrompts();
    const exam = prompts.find(p => p.id === examId);

    if (!exam) return notFound();

    return <WritingClient exam={exam} />;
  } catch (error) {
    console.error('Failed to load exam:', error);
    return notFound();
  }
}
