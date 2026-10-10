// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: POST /api/v1/dispatch/[id]/reassign
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate, authorizePermission } from '@/lib/server/auth/middleware.helpers';
import { dispatchService } from '@/lib/server/services/dispatch.service';
import { ReassignDispatchSchema } from '@/lib/domain/dispatch/dispatch.validator';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await authenticate(req);
    await authorizePermission(req, 'INCIDENT', 'UPDATE');

    const body = await req.json();
    const parsed = ReassignDispatchSchema.parse({ ...body, dispatchId: id });
    const updated = await dispatchService.reassignDispatch(id, parsed.newOfficerId, parsed.reassignReason);
    return NextResponse.json({ data: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.statusCode || 400 });
  }
}
