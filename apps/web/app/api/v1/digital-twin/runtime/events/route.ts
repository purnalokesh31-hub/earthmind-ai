// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: GET /api/v1/digital-twin/runtime/events
// City Runtime Telemetry Update Events Log API
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { cityIntelligenceRuntimeService } from '@/lib/server/services/city-intelligence-runtime.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await authenticate(req);
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: err.message || 'Authentication required',
        },
      },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const cityId = searchParams.get('cityId') || 'city-vja';
    const mode = searchParams.get('executionMode') || searchParams.get('mode') || undefined;
    const domainFilter = searchParams.get('domain');
    const eventTypeFilter = searchParams.get('eventType');
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    if (mode && ['LIVE_WRITE', 'AUTONOMOUS', 'PHYSICAL_EXECUTION'].includes(mode)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'AUTONOMOUS_EXECUTION_FORBIDDEN',
            message: `Execution mode '${mode}' is strictly forbidden. EarthMind PIOS is advisory-only.`,
          },
          governance: {
            requiresHumanApproval: true,
            advisoryOnly: true,
            autonomousExecution: false,
          },
        },
        { status: 403 }
      );
    }

    let events = await cityIntelligenceRuntimeService.getRuntimeEvents(cityId, mode);

    if (domainFilter) {
      events = events.filter((e) => e.domain.toUpperCase() === domainFilter.toUpperCase());
    }

    if (eventTypeFilter) {
      events = events.filter((e) => e.eventType.toUpperCase() === eventTypeFilter.toUpperCase());
    }

    const paginatedEvents = events.slice(0, limit);

    return NextResponse.json({
      success: true,
      data: paginatedEvents,
      total: events.length,
      governance: {
        requiresHumanApproval: true,
        advisoryOnly: true,
        autonomousExecution: false,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: err.message?.includes('FORBIDDEN_EXECUTION_MODE')
            ? 'AUTONOMOUS_EXECUTION_FORBIDDEN'
            : 'RUNTIME_UNAVAILABLE',
          message: err.message || 'Runtime events log is temporarily unavailable.',
        },
      },
      { status: err.message?.includes('FORBIDDEN_EXECUTION_MODE') ? 403 : 500 }
    );
  }
}
