// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Shared DTO Primitives & API Envelope
// ──────────────────────────────────────────────────────────────
// All API responses are wrapped in ApiResponseDto<T>.
// Controllers never expose raw Prisma entities.
// ──────────────────────────────────────────────────────────────

// ── Standard API Response Envelope ────────────────────────────
export interface ApiResponseDto<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiErrorDto;
  meta?: ApiMetaDto;
  traceId?: string;
  timestamp: string;
}

export interface ApiErrorDto {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export interface ApiMetaDto {
  page?: number;
  pageSize?: number;
  total?: number;
  totalPages?: number;
}

// ── DTO Factory Helpers ────────────────────────────────────────
export function successResponse<T>(data: T, meta?: ApiMetaDto, traceId?: string): ApiResponseDto<T> {
  return {
    success: true,
    data,
    meta,
    traceId,
    timestamp: new Date().toISOString(),
  };
}

export function errorResponse(
  code: string,
  message: string,
  details?: Record<string, string[]>,
  traceId?: string
): ApiResponseDto<never> {
  return {
    success: false,
    error: { code, message, details },
    traceId,
    timestamp: new Date().toISOString(),
  };
}
