import { api } from './api';
import type { ExamPrompt, OutlineStep } from '../types/exam';

function normalizeOutlineRow(row: unknown, i: number): OutlineStep {
  const r = row as Record<string, unknown>;
  return {
    index: Number(r.index ?? r.Index ?? i + 1),
    title: String(r.title ?? r.Title ?? ''),
    hint: String(r.hint ?? r.Hint ?? ''),
  };
}

export const examPromptService = {
  async getAll(params?: { taskType?: string; cefrLevel?: string }): Promise<ExamPrompt[]> {
    const { data } = await api.get<ExamPrompt[]>('/v2/ExamPrompts', { params });
    return data ?? [];
  },

  async getById(id: string): Promise<ExamPrompt> {
    const { data } = await api.get<ExamPrompt>(`/v2/ExamPrompts/${encodeURIComponent(id)}`);
    return data;
  },

  /** Hướng dẫn cấu trúc sinh theo đề (backend Gemini — cùng endpoint web WritingClient) */
  async getOutline(id: string): Promise<OutlineStep[]> {
    const { data } = await api.get<unknown[]>(
      `/v2/ExamPrompts/${encodeURIComponent(id)}/outline`
    );
    if (!Array.isArray(data)) return [];
    return data.map((row, i) => normalizeOutlineRow(row, i));
  },
};
