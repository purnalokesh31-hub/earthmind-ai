// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: GET /api/v1/ai/tasks/[id]
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { agentOrchestratorService } from '@/lib/server/ai-agents/agent-orchestrator.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await authenticate(req);
    const { id } = await params;
    const task = await agentOrchestratorService.getTask(id);

    if (!task) {
      return NextResponse.json({ error: 'AI task record not found' }, { status: 404 });
    }

    return NextResponse.json({ data: task });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
