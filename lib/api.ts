export const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';

export type User = { id: number; name: string; email: string; role: 'admin' | 'member' };
export type Equipment = { id: number; name: string; category: string; description: string; status: string; booked?: { id: number; start_at: string; end_at: string }[] };
export type Reservation = { id: number; equipment_id: number; user_id: number; start_at: string; end_at: string; status: string; equipment?: Equipment; user?: User };
export type Inquiry = {
  id: number; content: string; equipment?: Equipment | null; user?: User; created_at: string;
  ai_summary: string | null; ai_category: string | null; ai_reply_draft: string | null;
};

export class ApiError extends Error {
  fields: Record<string, string>;
  status: number;
  constructor(message: string, fields: Record<string, string> = {}, status = 0) {
    super(message);
    this.fields = fields;
    this.status = status;
  }
}

export function getToken() {
  try { return localStorage.getItem('token'); } catch { return null; }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  let res: Response;
  try {
    res = await fetch(API + path, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(init?.headers || {}) },
    });
  } catch {
    throw new ApiError('서버에 연결하지 못했어요. 잠시 뒤 다시 시도해 주세요. (무료 서버는 첫 접속이 1분 가까이 걸릴 수 있어요)');
  }
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(
      (body && typeof body.message === 'string' && body.message) || '문제가 생겼어요. 잠시 뒤 다시 시도해 주세요.',
      (body && body.fields) || {},
      res.status,
    );
  }
  return body as T;
}

export const fmt = (iso: string) => {
  const d = new Date(iso);
  const kst = new Date(d.getTime() + 9 * 3600e3);
  return `${kst.toISOString().slice(5, 10).replace('-', '/')} ${kst.toISOString().slice(11, 16)}`;
};
export const fmtRange = (s: string, e: string) => `${fmt(s)} ~ ${fmt(e).slice(6)}`;
