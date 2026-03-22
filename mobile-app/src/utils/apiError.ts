import axios, { type AxiosError } from 'axios';
import { config } from '../config/env';

const UNKNOWN =
  'Lỗi không xác định. Xem log Metro hoặc terminal backend; thử lại.';

const MSG_401 =
  'Phiên đăng nhập hết hạn hoặc token không hợp lệ. Vui lòng đăng nhập lại. (HTTP 401)';

/**
 * Trích message thân thiện từ Axios/API (.NET BadRequest { message }, ProblemDetails, v.v.).
 * Luôn trả chuỗi không rỗng (Alert RN có thể không hiện body nếu "").
 */
export function extractApiErrorMessage(err: unknown): string {
  const ensure = (s: string) => (s.trim().length > 0 ? s : UNKNOWN);

  if (axios.isAxiosError(err)) {
    const um = (err as { userMessage?: string }).userMessage;
    if (um && um.trim()) return ensure(um);
  }

  if (!axios.isAxiosError(err)) {
    if (err instanceof Error && err.message.trim()) return ensure(err.message);
    return UNKNOWN;
  }

  if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
    return 'Hết thời gian chờ. Thử lại; kiểm tra mạng hoặc tăng timeout (chấm AI có thể lâu).';
  }

  if (!err.response) {
    return ensure(
      `Không kết nối được API (${err.message || 'network'}).\n` +
        `Kiểm tra WiFi / EXPO_PUBLIC_API_URL (không dùng 127.0.0.1 trên máy thật nếu chưa adb reverse).\n\n` +
        `${config.API_BASE_URL}`
    );
  }

  const raw = err.response.data;
  const status = err.response.status;

  if (typeof raw === 'string') {
    const t = raw.trim();
    if (t) return ensure(t.slice(0, 800));
    if (status === 401) return ensure(MSG_401);
    return ensure(`HTTP ${status} (body rỗng)`);
  }

  const d = raw as
    | { message?: string; title?: string; detail?: string; error?: string; code?: string }
    | null
    | undefined;

  const piece =
    [d?.message, d?.title, d?.detail, d?.error].find(
      (x) => x != null && String(x).trim().length > 0
    ) ?? (d?.code ? `Mã: ${d.code}` : null);

  if (piece != null) return ensure(String(piece).slice(0, 800));

  try {
    if (raw !== undefined && raw !== null) {
      const j = JSON.stringify(raw);
      if (j && j !== '{}' && j !== 'null') return ensure(j.slice(0, 800));
    }
  } catch {
    /* ignore */
  }

  if (status === 401) return ensure(MSG_401);

  return ensure(`HTTP ${status}. ${UNKNOWN}`);
}

/** Gắn `userMessage` lên AxiosError để màn hình đọc nhanh (vẫn là AxiosError). */
export function attachUserMessage(err: unknown): unknown {
  if (axios.isAxiosError(err)) {
    (err as AxiosError & { userMessage?: string }).userMessage =
      extractApiErrorMessage(err);
  }
  return err;
}
