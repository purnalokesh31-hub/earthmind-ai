// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: GET /api/v1/ai/tasks
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { agentOrchestratorService } from '@/lib/server/ai-agents/agent-orchestrator.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await authenticate(req);
    const tasks = await agentOrchestratorService.listTasks();
    return NextResponse.json({ data: tasks, total: tasks.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
