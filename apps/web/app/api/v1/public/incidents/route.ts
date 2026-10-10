// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: GET /api/v1/public/incidents
// Public Transparency View (Masked Citizen Identity & Private Data Removed)
// ──────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { memoryCitizenReportRepository } from '@/lib/server/repositories/citizen-report.repository';

export const dynamic = 'force-dynamic';

export async function GET() {
  const reports = await memoryCitizenReportRepository.listSubmitted();

  const publicData = reports
    .filter((r) => r.visibility !== 'PRIVATE')
    .map((r) => ({
      id: r.id,
      reportCode: r.reportCode,
      category: r.category,
      title: r.title,
      locationName: r.locationName,
      latitude: r.latitude,
      longitude: r.longitude,
      status: r.status,
      createdAt: r.createdAt,
    }));

  return NextResponse.json({ data: publicData, total: publicData.length });
}
