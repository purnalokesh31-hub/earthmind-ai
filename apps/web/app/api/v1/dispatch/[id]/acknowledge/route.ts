// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: POST /api/v1/dispatch/[id]/acknowledge
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { dispatchService } from '@/lib/server/services/dispatch.service';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await authenticate(req);
    const body = await req.json().catch(() => ({}));
    const updated = await dispatchService.acknowledgeDispatch(id, body.notes);
    return NextResponse.json({ data: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.statusCode || 400 });
  }
}
