// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: GET /api/v1/digital-twin/runtime/overview
// Executive Level Runtime Summary API
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

    const snapshot = await cityIntelligenceRuntimeService.getRuntimeSnapshot(cityId, mode);

    const degradedDomains = Object.values(snapshot.domains)
      .filter((d) => d.providerStatus === 'DEGRADED' || d.dataQuality === 'STALE')
      .map((d) => d.domain);

    const missingDomains = snapshot.coverage.missingDomains;

    const fallbackDomains = Object.values(snapshot.domains)
      .filter((d) => d.fallbackActive)
      .map((d) => d.domain);

    const recommendations = (await cityIntelligenceRuntimeService.getRecommendations(cityId)).recommendations;

    const overviewData = {
      cityId: snapshot.cityId,
      runtimeMode: snapshot.executionMode,
      overallStatus: snapshot.health.readinessStatus || 'READY_WITH_WARNINGS',
      cityIntelligenceReadiness: snapshot.health.cityIntelligenceReadiness,
      telemetryCoverage: snapshot.health.telemetryCoverage,
      dataQualityScore: snapshot.health.dataQualityScore,
      freshnessScore: snapshot.health.freshnessScore,
      providerHealthScore: snapshot.health.providerHealthScore,
      activeAlerts: snapshot.alerts.length,
      degradedDomains,
      missingDomains,
      fallbackDomains,
      lastUpdated: snapshot.timestamp,
      summary: `City runtime operating in ${snapshot.executionMode} mode with readiness ${snapshot.health.cityIntelligenceReadiness}/100 across 7 domains.`,
      recommendations: recommendations.map((r) => ({
        ...r,
        requiresHumanApproval: true,
        advisoryOnly: true,
        autonomousExecution: false,
      })),
    };

    return NextResponse.json({
      success: true,
      data: overviewData,
      governance: {
        requiresHumanApproval: true,
        advisoryOnly: true,
        autonomousExecution: false,
      },
      provenance: snapshot.provenance,
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
          message: err.message || 'City runtime overview is temporarily unavailable.',
        },
      },
      { status: err.message?.includes('FORBIDDEN_EXECUTION_MODE') ? 403 : 500 }
    );
  }
}
