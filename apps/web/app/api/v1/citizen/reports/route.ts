// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: /api/v1/citizen/reports
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticateOrPrototypeUser } from '@/lib/server/auth/middleware.helpers';
import { memoryCitizenReportRepository } from '@/lib/server/repositories/citizen-report.repository';
import { citizenReportClassificationService } from '@/lib/server/services/citizen-report-classification.service';
import {
  CitizenReportEntity,
  CitizenReportLocationSource,
} from '@/lib/server/domain/citizen-report.domain';

export const dynamic = 'force-dynamic';

const locationSources = new Set<CitizenReportLocationSource>(['DEVICE_GPS', 'EXIF', 'MANUAL', 'UNKNOWN']);

function optionalFiniteNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function parseLocation(body: any):
  | {
      ok: true;
      latitude?: number;
      longitude?: number;
      locationSource: CitizenReportLocationSource;
      accuracyMeters?: number;
    }
  | { ok: false; error: string } {
  const latitude = optionalFiniteNumber(body.latitude);
  const longitude = optionalFiniteNumber(body.longitude);
  const accuracyMeters = optionalFiniteNumber(body.accuracyMeters);
  const requestedSource = body.locationSource;
  const locationSource = locationSources.has(requestedSource) ? requestedSource : 'UNKNOWN';

  if ((latitude === undefined) !== (longitude === undefined)) {
    return { ok: false, error: 'latitude and longitude must be supplied together' };
  }

  if (latitude !== undefined && (latitude < -90 || latitude > 90)) {
    return { ok: false, error: 'latitude must be between -90 and 90' };
  }

  if (longitude !== undefined && (longitude < -180 || longitude > 180)) {
    return { ok: false, error: 'longitude must be between -180 and 180' };
  }

  if (accuracyMeters !== undefined && accuracyMeters < 0) {
    return { ok: false, error: 'accuracyMeters must be zero or greater' };
  }

  if (locationSource === 'DEVICE_GPS' && (latitude === undefined || longitude === undefined)) {
    return { ok: false, error: 'DEVICE_GPS locationSource requires latitude and longitude' };
  }

  return { ok: true, latitude, longitude, locationSource, accuracyMeters };
}

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateOrPrototypeUser(req);
    const reports = await memoryCitizenReportRepository.findByCitizenId(user.userId || 'usr-cit-101');
    return NextResponse.json({ data: reports, total: reports.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateOrPrototypeUser(req);
    const body = await req.json();

    if (!body.title || !body.category) {
      return NextResponse.json({ error: 'title and category are required' }, { status: 400 });
    }

    const parsedLocation = parseLocation(body);
    if (!parsedLocation.ok) {
      return NextResponse.json({ error: parsedLocation.error }, { status: 400 });
    }

    const classification = await citizenReportClassificationService.classifyReport(body.title, body.description || '');

    const newReport: CitizenReportEntity = {
      id: `cit-rep-${Date.now()}`,
      reportCode: `CIT-${Date.now().toString().slice(-4)}`,
      citizenId: user.userId || 'usr-cit-101',
      citizenNameMasked: `${user.email?.[0] || 'C'}****`,
      category: body.category,
      title: body.title,
      description: body.description || '',
      locationName: body.locationName || 'Vijayawada Sector',
      latitude: parsedLocation.latitude,
      longitude: parsedLocation.longitude,
      locationSource: parsedLocation.locationSource,
      accuracyMeters: parsedLocation.accuracyMeters,
      cityId: body.cityId || 'city-vja',
      zoneId: body.zoneId || 'zone-w12',
      status: 'SUBMITTED',
      priority: classification.suggestedSeverity as any,
      visibility: body.visibility || 'ANONYMOUS_PUBLIC',
      evidenceIds: body.evidenceIds || [],
      consent: {
        dataProcessingConsent: true,
        publicDisplayConsent: true,
        contactConsent: true,
        consentedAt: new Date(),
      },
      aiClassification: classification,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const saved = await memoryCitizenReportRepository.save(newReport);
    return NextResponse.json({ success: true, data: saved, message: 'Citizen report submitted successfully' }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
