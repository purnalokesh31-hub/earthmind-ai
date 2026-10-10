// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: POST /api/v1/dispatch/[id]/escalate
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate, authorizePermission } from '@/lib/server/auth/middleware.helpers';
import { dispatchService } from '@/lib/server/services/dispatch.service';
import { EscalateDispatchSchema } from '@/lib/domain/dispatch/dispatch.validator';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await authenticate(req);
    await authorizePermission(req, 'INCIDENT', 'UPDATE');

    const body = await req.json();
    const parsed = EscalateDispatchSchema.parse({ ...body, dispatchId: id });
    const updated = await dispatchService.escalateDispatch(id, parsed.escalationReason);
    return NextResponse.json({ data: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.statusCode || 400 });
  }
}
