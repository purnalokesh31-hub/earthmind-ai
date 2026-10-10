// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Citizen Report Location Provenance Tests
// ──────────────────────────────────────────────────────────────

import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as createCitizenReport } from '@/app/api/v1/citizen/reports/route';
import { JwtService } from '@/lib/server/auth/jwt.service';

describe('Citizen report location provenance', () => {
  const jwtService = new JwtService();

  async function createAuthHeaders(userId = 'usr-cit-location') {
    const token = await jwtService.generateAccessToken({
      sub: userId,
      email: `${userId}@earthmind.test`,
      role: 'CITIZEN',
      jti: `jti-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    });

    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  it('accepts denied or unavailable GPS reports without hardcoded fallback coordinates', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/citizen/reports', {
      method: 'POST',
      headers: await createAuthHeaders('usr-cit-no-gps'),
      body: JSON.stringify({
        category: 'ROAD_DAMAGE',
        title: 'Pothole reported without location permission',
        description: 'Citizen denied GPS permission but still provided a text location.',
        locationName: 'Near Canal Road bus stop',
        locationSource: 'UNKNOWN',
      }),
    });

    const res = await createCitizenReport(req);
    expect(res.status).toBe(201);
    const json = await res.json();

    expect(json.success).toBe(true);
    expect(json.data.locationSource).toBe('UNKNOWN');
    expect(json.data.latitude).toBeUndefined();
    expect(json.data.longitude).toBeUndefined();
    expect(json.data.accuracyMeters).toBeUndefined();
  });

  it('persists device GPS source and accuracy when coordinates are provided', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/citizen/reports', {
      method: 'POST',
      headers: await createAuthHeaders('usr-cit-gps'),
      body: JSON.stringify({
        category: 'FLOODING',
        title: 'Flooded underpass',
        description: 'Water level is rising near the underpass.',
        locationName: 'Governorpet underpass',
        latitude: 16.5132,
        longitude: 80.6321,
        accuracyMeters: 12.4,
        locationSource: 'DEVICE_GPS',
      }),
    });

    const res = await createCitizenReport(req);
    expect(res.status).toBe(201);
    const json = await res.json();

    expect(json.data.locationSource).toBe('DEVICE_GPS');
    expect(json.data.latitude).toBe(16.5132);
    expect(json.data.longitude).toBe(80.6321);
    expect(json.data.accuracyMeters).toBe(12.4);
  });

  it('rejects inconsistent DEVICE_GPS provenance without coordinates', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/citizen/reports', {
      method: 'POST',
      headers: await createAuthHeaders('usr-cit-bad-gps'),
      body: JSON.stringify({
        category: 'GARBAGE',
        title: 'Overflowing waste bin',
        locationName: 'Market entrance',
        locationSource: 'DEVICE_GPS',
      }),
    });

    const res = await createCitizenReport(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('DEVICE_GPS locationSource requires latitude and longitude');
  });
});
