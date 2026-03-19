import { ResultClient } from '@/components/features/feedback/ResultClient';

export const metadata = {
  title: 'Kết quả chấm điểm | VSTEP Writing Lab',
};

export default function ResultPage({ params }: { params: { examId: string } }) {
  // We use the examId as the draftId for now in our simplified logic
  return (
    <div className="min-h-screen bg-slate-50">
      <ResultClient essayId={params.examId} />
    </div>
  );
}
