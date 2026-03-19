/**
 * lib/api.ts
 * Typed API client for the .NET backend.
 *
 * Features:
 *  - Auth: attaches Firebase ID token on every request
 *  - Timeout: 30 s for gradeEssay, 10 s for everything else
 *  - Retry: once on network error or 5xx; never on 4xx
 *  - Custom ApiError with HTTP status
 */
import { auth } from '@/lib/firebase';
import type { GradingResult, ExamPrompt, GradingRequest } from '@/types/grading';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://localhost:5001';

// ── Error class ──────────────────────────────────────────────
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ── Helpers ──────────────────────────────────────────────────

async function getIdToken(): Promise<string | null> {
  try {
    const user = auth.currentUser;
    return user ? await user.getIdToken() : null;
  } catch {
    return null;
  }
}

function buildHeaders(token: string | null): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function parseResponse<T>(res: Response): Promise<T> {
  if (res.ok) {
    return res.json() as Promise<T>;
  }

  let message = `HTTP ${res.status}`;
  try {
    const body = (await res.json()) as { message?: string; title?: string };
    message = body.message ?? body.title ?? message;
  } catch {
    // ignore parse failure, keep generic message
  }
  throw new ApiError(res.status, message);
}

interface FetchOptions {
  method?: string;
  body?: unknown;
  timeoutMs?: number;
}

async function fetchWithRetry<T>(
  path: string,
  { method = 'GET', body, timeoutMs = 10_000 }: FetchOptions,
  attempt = 0
): Promise<T> {
  const token = await getIdToken();
  const controller = new AbortController();
  const timerId = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: buildHeaders(token),
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timerId);
    // Network error — retry once
    if (attempt === 0) {
      return fetchWithRetry<T>(path, { method, body, timeoutMs }, 1);
    }
    throw new ApiError(0, (err as Error).message ?? 'Network error');
  } finally {
    clearTimeout(timerId);
  }

  // 5xx — retry once
  if (res.status >= 500 && attempt === 0) {
    return fetchWithRetry<T>(path, { method, body, timeoutMs }, 1);
  }

  return parseResponse<T>(res);
}

// ── Public API functions ─────────────────────────────────────

/**
 * Submit an essay for AI grading.
 * Timeout: 30 s (AI takes a while), 1 retry on 5xx/network error.
 */
export async function gradeEssay(
  request: GradingRequest
): Promise<GradingResult> {
  const { studentId, ...body } = request;
  return fetchWithRetry<GradingResult>(
    `/api/grading/grade?studentId=${encodeURIComponent(studentId)}`,
    { method: 'POST', body, timeoutMs: 30_000 }
  );
}

/**
 * Fetch active exam prompts, optionally filtered by taskType / cefrLevel.
 * Timeout: 10 s.
 */
export async function getExamPrompts(params?: {
  taskType?: 'task1' | 'task2';
  cefrLevel?: 'B1' | 'B2' | 'C1';
}): Promise<ExamPrompt[]> {
  const qs = new URLSearchParams();
  if (params?.taskType) qs.set('taskType', params.taskType);
  if (params?.cefrLevel) qs.set('cefrLevel', params.cefrLevel);
  const query = qs.toString() ? `?${qs.toString()}` : '';
  return fetchWithRetry<ExamPrompt[]>(`/api/exam-prompts${query}`, {
    timeoutMs: 10_000,
  });
}
