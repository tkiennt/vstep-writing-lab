import { getExamPrompts } from '@/lib/api';
import { ExamPrompt } from '@/types/grading';
import { PracticeSelectionClient } from '@/components/features/practice/PracticeSelectionClient';

export const metadata = {
  title: 'Luyện viết VSTEP | VSTEP Writing Lab',
  description: 'Chọn đề bài, viết bài và nhận phản hồi chi tiết từ AI.',
};

export default async function PracticePage() {
  let prompts: ExamPrompt[] = [];

  try {
    prompts = await getExamPrompts({ });
  } catch (err) {
    console.error('[PracticePage] Failed to fetch exam prompts:', err);
  }

  return <PracticeSelectionClient initialPrompts={prompts} />;
}
