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
import type { GradingResult, ExamPrompt } from '@/types/grading';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://localhost:7133';

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

// ── Token Cache ───────────────────────────────────────────────
let _cachedToken: string | null = null;
let _tokenExpiresAt = 0;

async function getIdToken(): Promise<string | null> {
  try {
    const user = auth.currentUser;
    if (!user) return null;
    
    const now = Date.now();
    // Reuse cached token if still valid (with 60s buffer before expiry)
    if (_cachedToken && now < _tokenExpiresAt - 60_000) {
      return _cachedToken;
    }
    
    // false = don't force-refresh (uses Firebase's built-in cache)
    _cachedToken = await user.getIdToken(false);
    // Firebase tokens expire in 1 hour
    _tokenExpiresAt = now + 60 * 60 * 1000;
    return _cachedToken;
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
  { method = 'GET', body, timeoutMs = 5_000 }: FetchOptions,
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

export interface GradeEssayRequest {
  essayId: string;
  taskType: 'task1' | 'task2';
  prompt: string;
  essayText: string;
  wordCount: number;
}

/**
 * Submit an essay for AI grading.
 * Timeout: 30 s (AI takes a while), 1 retry on 5xx/network error.
 */
export async function gradeEssay(request: GradeEssayRequest, studentId: string): Promise<GradingResult> {
  return fetchWithRetry<GradingResult>(`/api/v2/Grading/grade?studentId=${studentId}`, {
    method: 'POST',
    body: request,
    timeoutMs: 30_000,
  });
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
  return fetchWithRetry<ExamPrompt[]>(`/api/v2/ExamPrompts${query}`, {
    timeoutMs: 3_000,
  });
}
