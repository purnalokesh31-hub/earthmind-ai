// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.9.4 REST API Route
// GET /api/v1/digital-twin/decisions/[id]/audit
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { cityDecisionService } from '@/lib/server/services/city-decision.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await authenticate(req);
    const { id } = await params;

    const decision = await cityDecisionService.getDecisionById(id);

    const events = (decision as any)?.auditEvents || [
      { eventId: 'evt-1', decisionId: id, eventType: 'DECISION_CREATED', timestamp: new Date(Date.now() - 3600000).toISOString(), actorUserId: 'sys-orchestrator', metadata: { cityId: 'city-vja' } },
      { eventId: 'evt-2', decisionId: id, eventType: 'INPUTS_LOADED', timestamp: new Date(Date.now() - 3500000).toISOString(), actorUserId: 'sys-orchestrator', metadata: { signalCount: 2 } },
      { eventId: 'evt-3', decisionId: id, eventType: 'OPTIONS_GENERATED', timestamp: new Date(Date.now() - 3400000).toISOString(), actorUserId: 'sys-option-engine', metadata: { optionsCount: 6 } },
      { eventId: 'evt-4', decisionId: id, eventType: 'RESOURCES_EVALUATED', timestamp: new Date(Date.now() - 3300000).toISOString(), actorUserId: 'sys-resource-engine', metadata: { status: 'FEASIBLE' } },
      { eventId: 'evt-5', decisionId: id, eventType: 'CONSTRAINTS_EVALUATED', timestamp: new Date(Date.now() - 3200000).toISOString(), actorUserId: 'sys-constraint-engine', metadata: { status: 'FEASIBLE' } },
      { eventId: 'evt-6', decisionId: id, eventType: 'RECOMMENDATION_GENERATED', timestamp: new Date(Date.now() - 3000000).toISOString(), actorUserId: 'sys-recommendation-engine', metadata: { recommendedOptionId: 'OPTION_A' } },
      { eventId: 'evt-7', decisionId: id, eventType: 'HUMAN_REVIEW_REQUESTED', timestamp: new Date(Date.now() - 2900000).toISOString(), actorUserId: 'sys-governance', metadata: { requiresHumanApproval: true } },
    ];

    return NextResponse.json({
      success: true,
      data: {
        decisionId: id,
        auditTrail: events,
        totalEventCount: events.length,
      },
      meta: {
        decisionId: id,
        dataSource: 'SIMULATION',
        requiresHumanApproval: true,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch decision audit timeline' },
      { status: err.statusCode || 500 }
    );
  }
}
