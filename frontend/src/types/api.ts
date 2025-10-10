export interface CommonTask {
  id: number;
  weekday: number; // 0 (Sun) .. 6 (Sat)
  start_time: string; // HH:MM[:SS]
  end_time: string;   // HH:MM[:SS]
  slot: number;       // 1 or 2
  created_at?: string;
}

export type ExceptionStatus = 'updated' | 'deleted';

export interface ExceptionTask {
  id: number;
  common_tasks_id: number | null;
  slot_date: string; // YYYY-MM-DD
  status: ExceptionStatus;
  start_time?: string | null;
  end_time?: string | null;
  slot?: number | null; // 1 or 2
  created_at?: string;
}

export interface ApiListResponse<T> {
  success: boolean;
  data: T[];
  message?: string;
}

export interface ApiItemResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}


