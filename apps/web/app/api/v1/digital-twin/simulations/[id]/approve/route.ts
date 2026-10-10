// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: POST /api/v1/digital-twin/simulations/[id]/approve
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { memoryDigitalTwinSimulationRepository } from '@/lib/server/repositories/digital-twin-simulation.repository';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await authenticate(req);
    const { id } = await params;

    const scenario = await memoryDigitalTwinSimulationRepository.findById(id);
    if (!scenario) {
      return NextResponse.json({ error: 'Simulation scenario not found' }, { status: 404 });
    }

    scenario.status = 'APPROVED';
    scenario.approvalStatus = 'APPROVED';
    scenario.updatedAt = new Date();
    await memoryDigitalTwinSimulationRepository.save(scenario);

    return NextResponse.json({ data: scenario, message: 'Scenario recommendation approved for human dispatch authorization' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
