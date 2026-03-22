import type { ExamPrompt } from '../types/exam';
import type { PracticeSessionMode } from '../types/practiceMode';

export type ProfileStackParamList = {
  ProfileMain: undefined;
};

export type PracticeStackParamList = {
  PracticeList: undefined;
  /** Sau khi chọn đề — chọn Guided / Practice / Exam */
  PracticeModeSelect: { examId: string; exam?: ExamPrompt };
  /** exam + mode: truyền từ danh sách / màn chọn chế độ */
  PracticeWrite: {
    examId: string;
    exam?: ExamPrompt;
    mode?: PracticeSessionMode;
  };
};
