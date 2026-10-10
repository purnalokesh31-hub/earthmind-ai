// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: POST /api/v1/ai/recommendations/[id]/approve
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { commanderOnly } from '@/lib/server/auth/middleware.helpers';
import { approvalService } from '@/lib/server/ai-agents/approval.service';
import { agentOrchestratorService } from '@/lib/server/ai-agents/agent-orchestrator.service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Authorizing an AI recommendation for execution is a high-risk action — requires COMMANDER or above.
    const user = await commanderOnly(req);
    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    const tasks = await agentOrchestratorService.listTasks();
    const task = tasks.find((t) => t.recommendation?.recommendationId === id);

    if (!task || !task.recommendation) {
      return NextResponse.json({ error: `Recommendation ${id} not found` }, { status: 404 });
    }

    const updatedRec = await approvalService.approveRecommendation(
      task.recommendation,
      user.userId,
      user.role,
      body.reasonNote
    );

    task.status = 'EXECUTING';
    task.updatedAt = new Date();

    return NextResponse.json({ data: updatedRec, message: 'Recommendation authorized and queued for execution' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
