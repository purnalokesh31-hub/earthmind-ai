import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as createIncident } from '../../app/api/v1/incidents/route';
import { DELETE as deleteIncident } from '../../app/api/v1/incidents/[id]/route';
import { TokenService } from '../../lib/server/auth';
import container, { TOKENS } from '../../lib/server/container';

describe('Phase 6.4 — RBAC & Incident Security Integration Verification', () => {
  let citizenToken: string;
  let viewerToken: string;
  let adminToken: string;
  const tokenService = new TokenService();

  const mockService = {
    createIncident: vi.fn().mockResolvedValue({ id: 'inc-rbac-1', title: 'Citizen Incident' }),
    deleteIncident: vi.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    container.registerValue(TOKENS.IncidentService, mockService as any);

    const citizenPair = await tokenService.issueTokenPair({
      id: 'usr-cit-1',
      email: 'citizen@earthmind.gov',
      role: 'CITIZEN',
    });
    citizenToken = citizenPair.accessToken;

    const viewerPair = await tokenService.issueTokenPair({
      id: 'usr-view-1',
      email: 'viewer@earthmind.gov',
      role: 'VIEWER',
    });
    viewerToken = viewerPair.accessToken;

    const adminPair = await tokenService.issueTokenPair({
      id: 'usr-admin-rbac',
      email: 'admin@earthmind.gov',
      role: 'SYSTEM_ADMIN',
    });
    adminToken = adminPair.accessToken;
  });

  it('should allow CITIZEN role to create an incident', async () => {
    const req = new Request('http://localhost:3000/api/v1/incidents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${citizenToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Road Obstruction',
        description: 'Fallen tree blocking lane',
        category: 'TRAFFIC',
        locationName: 'Main St',
      }),
    });

    const res = await createIncident(req);
    expect(res.status).toBe(201);
  });

  it('should deny VIEWER role from creating an incident (403 Forbidden)', async () => {
    const req = new Request('http://localhost:3000/api/v1/incidents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${viewerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Unauthorized Incident',
        description: 'Should be rejected',
        category: 'TRAFFIC',
        locationName: 'Main St',
      }),
    });

    const res = await createIncident(req);
    expect(res.status).toBe(403);
  });

  it('should deny CITIZEN role from deleting an incident (403 Forbidden)', async () => {
    const params = Promise.resolve({ id: 'inc-rbac-1' });

    const req = new Request('http://localhost:3000/api/v1/incidents/inc-rbac-1', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${citizenToken}` },
    });

    const res = await deleteIncident(req, { params });
    expect(res.status).toBe(403);
  });

  it('should allow SYSTEM_ADMIN role to delete an incident', async () => {
    const params = Promise.resolve({ id: 'inc-rbac-1' });

    const req = new Request('http://localhost:3000/api/v1/incidents/inc-rbac-1', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    const res = await deleteIncident(req, { params });
    expect(res.status).toBe(200);
  });
});
