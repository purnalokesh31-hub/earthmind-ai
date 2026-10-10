// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: POST /api/v1/ai/query
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { agentOrchestratorService } from '@/lib/server/ai-agents/agent-orchestrator.service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = await authenticate(req);
    const body = await req.json();

    if (!body.query) {
      return NextResponse.json({ error: 'query is required' }, { status: 400 });
    }

    const task = await agentOrchestratorService.executeTask(
      body.query,
      user.email || 'Duty Commander',
      body.taskType || 'CUSTOM_QUERY',
      body.scopeId || 'city-vja'
    );

    return NextResponse.json({ data: task, message: 'AI Agent task processed successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
