const API_BASE = (process.env.REACT_APP_API_BASE || 'http://localhost:8000').replace(/\/$/, '');

type JsonRecord = Record<string, unknown>;

async function handleResponse<T>(res: Response): Promise<T> {
  let data: unknown = null;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await res.json().catch(() => null);
  } else {
    data = await res.text().catch(() => null);
  }

  if (!res.ok) {
    const message = (typeof data === 'object' && data && 'message' in data)
      ? String((data as JsonRecord).message)
      : `Request failed with status ${res.status}`;
    throw new Error(message);
  }
  return data as T;
}

export async function getJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  });
  return handleResponse<T>(res);
}

export async function postJson<TResponse, TBody extends JsonRecord = JsonRecord>(
  path: string,
  body: TBody,
  init?: RequestInit
): Promise<TResponse> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(init?.headers || {}),
    },
    body: JSON.stringify(body),
    ...init,
  });
  return handleResponse<TResponse>(res);
}

// Convenience wrappers for current backend endpoints (optional)
export const Api = {
  getCommonTasks: (weekday?: number) => {
    const query = typeof weekday === 'number' ? `?weekday=${weekday}` : '';
    return getJson<{ success: boolean; data: any[] }>(`/api/get-common-tasks${query}`);
  },
  getExceptionTasksByDate: (date: string) => {
    return getJson<{ success: boolean; data: any[] }>(`/api/get-exception-tasks?date=${encodeURIComponent(date)}`);
  },
  getEffectiveSlots: (date: string) => {
    return getJson<{ success: boolean; data: any[] }>(`/api/get-effective-slots?date=${encodeURIComponent(date)}`);
  },
  createCommonTask: (payload: { weekday: number; start_time: string; end_time: string; slot: number; }) => {
    return postJson<{ success: boolean; data: any }>(`/api/create-common-tasks`, payload);
  },
  createExceptionTask: (payload: { common_tasks_id?: number | null; slot_date: string; status: 'updated' | 'deleted'; start_time?: string; end_time?: string; slot?: number; }) => {
    return postJson<{ success: boolean; data: any }>(`/api/create-exception-tasks`, payload);
  },
};

export default API_BASE;


