// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Zod Validation Engine (Zod v4)
// Intercepts & validates all request bodies before services run.
// Invalid payloads are rejected with standardized 400 responses.
// ──────────────────────────────────────────────────────────────

import { z } from 'zod';
import { errorResponse } from '../dto/shared.dto';

export interface ValidationSuccess<T> {
  success: true;
  data: T;
}

export interface ValidationFailure {
  success: false;
  response: Response;
}

export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

// ── Core Validator ─────────────────────────────────────────────
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const fieldErrors = formatZodErrors(result.error);
  const body = errorResponse(
    'VALIDATION_ERROR',
    'Request validation failed',
    fieldErrors
  );

  return {
    success: false,
    response: new Response(JSON.stringify(body), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    }),
  };
}

// ── Async Request Body Parser + Validator ──────────────────────
export async function validateBody<T>(
  req: Request,
  schema: z.ZodSchema<T>
): Promise<ValidationResult<T>> {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    const errBody = errorResponse('PARSE_ERROR', 'Request body must be valid JSON');
    return {
      success: false,
      response: new Response(JSON.stringify(errBody), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }),
    };
  }

  return validate(schema, body);
}

// ── Async Optional Body Parser + Validator ─────────────────────
export async function validateBodyOptional<T>(
  req: Request,
  schema: z.ZodSchema<T>
): Promise<ValidationResult<T>> {
  let body: unknown = {};

  try {
    const text = await req.text();
    if (text && text.trim().length > 0) {
      body = JSON.parse(text);
    }
  } catch {
    const errBody = errorResponse('PARSE_ERROR', 'Request body must be valid JSON');
    return {
      success: false,
      response: new Response(JSON.stringify(errBody), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }),
    };
  }

  return validate(schema, body);
}

// ── Query Param Validator ──────────────────────────────────────
export function validateQuery<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>
): ValidationResult<T> {
  const rawQuery: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    rawQuery[key] = value;
  });
  return validate(schema, rawQuery);
}

// ── Zod Error → Field Error Map (Zod v4 compatible) ───────────
function formatZodErrors(error: z.ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const field = issue.path.join('.') || '_root';
    if (!fieldErrors[field]) {
      fieldErrors[field] = [];
    }
    fieldErrors[field].push(issue.message);
  }
  return fieldErrors;
}

export { z };
