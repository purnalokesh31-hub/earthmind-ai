// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: POST /api/v1/dispatch & GET /api/v1/dispatch
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate, authorizePermission } from '@/lib/server/auth/middleware.helpers';
import { dispatchService } from '@/lib/server/services/dispatch.service';
import { CreateDispatchSchema } from '@/lib/domain/dispatch/dispatch.validator';

export async function POST(req: NextRequest) {
  try {
    await authenticate(req);
    await authorizePermission(req, 'INCIDENT', 'UPDATE');

    const body = await req.json();
    const parsed = CreateDispatchSchema.parse(body);
    const result = await dispatchService.createDispatch(parsed);
    return NextResponse.json({ data: result }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Validation error' }, { status: err.statusCode || 400 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await authenticate(req);
    const active = await dispatchService.getActiveDispatches();
    return NextResponse.json({ data: active, total: active.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.statusCode || 401 });
  }
}
