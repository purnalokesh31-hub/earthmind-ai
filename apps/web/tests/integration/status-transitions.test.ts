import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as changeStatus } from '../../app/api/v1/incidents/[id]/status/route';
import { TokenService } from '../../lib/server/auth';
import container, { TOKENS } from '../../lib/server/container';

describe('Phase 6.4 — Incident Lifecycle & Status Transition Integration Verification', () => {
  let commanderToken: string;
  let officerToken: string;
  const tokenService = new TokenService();

  const mockIncidentDto = {
    id: 'inc-status-101',
    incidentCode: 'EM-2026-STAT1',
    title: 'Chemical Spill',
    status: 'ACTIVE',
    severity: 'HIGH',
    category: 'HAZMAT',
    department: 'ENVIRONMENTAL',
    locationName: 'North Dock',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockService = {
    changeStatus: vi.fn().mockImplementation(async (id, status) => ({
      ...mockIncidentDto,
      status,
    })),
  };

  beforeEach(async () => {
    container.registerValue(TOKENS.IncidentService, mockService as any);

    const commanderPair = await tokenService.issueTokenPair({
      id: 'usr-cmd-trans',
      email: 'commander@earthmind.gov',
      role: 'COMMANDER',
    });
    commanderToken = commanderPair.accessToken;

    const officerPair = await tokenService.issueTokenPair({
      id: 'usr-officer-trans',
      email: 'officer@earthmind.gov',
      role: 'FIELD_OFFICER',
    });
    officerToken = officerPair.accessToken;
  });

  it('should process status transition from ACTIVE to INVESTIGATING', async () => {
    const params = Promise.resolve({ id: 'inc-status-101' });

    const req = new Request('http://localhost:3000/api/v1/incidents/inc-status-101/status', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${officerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'INVESTIGATING',
        note: 'First responder team on site',
      }),
    });

    const res = await changeStatus(req, { params });
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.status).toBe('INVESTIGATING');
  });

  it('should process status transition from INVESTIGATING to RESOLVED', async () => {
    const params = Promise.resolve({ id: 'inc-status-101' });

    const req = new Request('http://localhost:3000/api/v1/incidents/inc-status-101/status', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${commanderToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'RESOLVED',
        note: 'Chemical containment complete',
      }),
    });

    const res = await changeStatus(req, { params });
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.status).toBe('RESOLVED');
  });
});
