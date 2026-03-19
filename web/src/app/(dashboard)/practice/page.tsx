/**
 * app/(dashboard)/practice/page.tsx
 * Server Component — fetches exam prompts at request time,
 * then hands off to PracticeClient for all interactivity.
 */
import { getExamPrompts } from '@/lib/api';
import { ExamPrompt } from '@/types/grading';
import { PracticeClient } from '@/components/grading/PracticeClient';

export const metadata = {
  title: 'Luyện viết VSTEP | VSTEP Writing Lab',
  description: 'Chọn đề bài, viết bài và nhận phản hồi chi tiết từ AI.',
};

export default async function PracticePage() {
  let prompts: ExamPrompt[] = [];

  try {
    prompts = await getExamPrompts({ });
  } catch (err) {
    // Backend may not be running in dev — page still renders with empty state
    console.error('[PracticePage] Failed to fetch exam prompts:', err);
  }

  return <PracticeClient initialPrompts={prompts} />;
}
