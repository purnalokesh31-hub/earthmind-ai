import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET as listIncidents, POST as createIncident } from '../../app/api/v1/incidents/route';
import { GET as getIncident, PATCH as updateIncident, DELETE as deleteIncident } from '../../app/api/v1/incidents/[id]/route';
import { POST as assignOfficer } from '../../app/api/v1/incidents/[id]/assign/route';
import { POST as changeStatus } from '../../app/api/v1/incidents/[id]/status/route';
import { POST as archiveIncident } from '../../app/api/v1/incidents/[id]/archive/route';
import { POST as restoreIncident } from '../../app/api/v1/incidents/[id]/restore/route';
import { POST as mergeIncident } from '../../app/api/v1/incidents/[id]/merge/route';
import { TokenService } from '../../lib/server/auth';
import container, { TOKENS } from '../../lib/server/container';

describe('Phase 6.4 — Incident REST API Integration Verification', () => {
  let adminToken: string;
  let commanderToken: string;
  let fieldOfficerToken: string;
  const tokenService = new TokenService();

  const mockIncidentDto = {
    id: 'inc-api-101',
    incidentCode: 'EM-2026-API1',
    title: 'Toxic Gas Leak at Refinery',
    description: 'Chemical cloud expanding near residential complex',
    status: 'ACTIVE',
    severity: 'CRITICAL',
    category: 'HAZMAT',
    department: 'ENVIRONMENTAL_HEALTH',
    riskScore: 88,
    locationName: 'East Industrial Zone',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockIncidentService = {
    createIncident: vi.fn().mockResolvedValue(mockIncidentDto),
    updateIncident: vi.fn().mockResolvedValue({ ...mockIncidentDto, title: 'Updated Gas Leak Title' }),
    assignOfficer: vi.fn().mockResolvedValue({ ...mockIncidentDto, assignedOfficerId: 'usr-officer-1', status: 'DISPATCHED' }),
    changeStatus: vi.fn().mockImplementation(async (_id, status) => ({ ...mockIncidentDto, status })),
    verifyIncident: vi.fn().mockResolvedValue({ ...mockIncidentDto, status: 'VERIFIED' }),
    resolveIncident: vi.fn().mockResolvedValue({ ...mockIncidentDto, status: 'RESOLVED' }),
    archiveIncident: vi.fn().mockResolvedValue({ ...mockIncidentDto, status: 'ARCHIVED' }),
    restoreIncident: vi.fn().mockResolvedValue({ ...mockIncidentDto, status: 'ACTIVE' }),
    mergeIncident: vi.fn().mockResolvedValue(mockIncidentDto),
    deleteIncident: vi.fn().mockResolvedValue(true),
    getIncidentById: vi.fn().mockResolvedValue(mockIncidentDto),
    searchIncidents: vi.fn().mockResolvedValue([mockIncidentDto]),
    searchIncidentsPaginated: vi.fn().mockResolvedValue({
      incidents: [mockIncidentDto],
      total: 1,
      page: 1,
      pageSize: 10,
    }),
  };

  beforeEach(async () => {
    container.registerValue(TOKENS.IncidentService, mockIncidentService as any);

    const adminPair = await tokenService.issueTokenPair({
      id: 'usr-admin-api',
      email: 'admin@earthmind.gov',
      role: 'SYSTEM_ADMIN',
    });
    adminToken = adminPair.accessToken;

    const commanderPair = await tokenService.issueTokenPair({
      id: 'usr-cmd-api',
      email: 'commander@earthmind.gov',
      role: 'COMMANDER',
    });
    commanderToken = commanderPair.accessToken;

    const officerPair = await tokenService.issueTokenPair({
      id: 'usr-officer-api',
      email: 'officer@earthmind.gov',
      role: 'FIELD_OFFICER',
    });
    fieldOfficerToken = officerPair.accessToken;
  });

  it('should list incidents via GET /api/v1/incidents with Bearer token authentication', async () => {
    const req = new Request('http://localhost:3000/api/v1/incidents?page=1&pageSize=10', {
      headers: { Authorization: `Bearer ${commanderToken}` },
    });

    const res = await listIncidents(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.incidents).toHaveLength(1);
  });

  it('should create new incident via POST /api/v1/incidents', async () => {
    const req = new Request('http://localhost:3000/api/v1/incidents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${commanderToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Toxic Gas Leak at Refinery',
        description: 'Chemical cloud expanding near residential complex',
        category: 'HAZMAT',
        severity: 'CRITICAL',
        department: 'ENVIRONMENTAL_HEALTH',
        locationName: 'East Industrial Zone',
      }),
    });

    const res = await createIncident(req);
    expect(res.status).toBe(201);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.id).toBe('inc-api-101');
  });

  it('should get, update, and delete incident via /api/v1/incidents/[id]', async () => {
    const params = Promise.resolve({ id: 'inc-api-101' });

    // GET
    const getReq = new Request('http://localhost:3000/api/v1/incidents/inc-api-101', {
      headers: { Authorization: `Bearer ${commanderToken}` },
    });
    const getRes = await getIncident(getReq, { params });
    expect(getRes.status).toBe(200);

    // PATCH
    const patchReq = new Request('http://localhost:3000/api/v1/incidents/inc-api-101', {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${commanderToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: 'Updated Gas Leak Title' }),
    });
    const patchRes = await updateIncident(patchReq, { params });
    expect(patchRes.status).toBe(200);

    // DELETE (Requires ADMIN or Commander)
    const deleteReq = new Request('http://localhost:3000/api/v1/incidents/inc-api-101', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const deleteRes = await deleteIncident(deleteReq, { params });
    expect(deleteRes.status).toBe(200);
  });

  it('should assign officer, update status, archive, restore, and merge incidents', async () => {
    const params = Promise.resolve({ id: 'inc-api-101' });

    // Assign Officer
    const assignReq = new Request('http://localhost:3000/api/v1/incidents/inc-api-101/assign', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${commanderToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ officerId: 'usr-officer-1', note: 'Dispatching unit' }),
    });
    const assignRes = await assignOfficer(assignReq, { params });
    expect(assignRes.status).toBe(200);

    // Change Status
    const statusReq = new Request('http://localhost:3000/api/v1/incidents/inc-api-101/status', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${fieldOfficerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'INVESTIGATING', note: 'Unit on scene' }),
    });
    const statusRes = await changeStatus(statusReq, { params });
    expect(statusRes.status).toBe(200);

    // Archive
    const archiveReq = new Request('http://localhost:3000/api/v1/incidents/inc-api-101/archive', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const archiveRes = await archiveIncident(archiveReq, { params });
    expect(archiveRes.status).toBe(200);

    // Restore
    const restoreReq = new Request('http://localhost:3000/api/v1/incidents/inc-api-101/restore', {
      method: 'POST',
      headers: { Authorization: `Bearer ${commanderToken}` },
    });
    const restoreRes = await restoreIncident(restoreReq, { params });
    expect(restoreRes.status).toBe(200);

    // Merge
    const mergeReq = new Request('http://localhost:3000/api/v1/incidents/inc-api-101/merge', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${commanderToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ duplicateIncidentId: 'inc-api-102' }),
    });
    const mergeRes = await mergeIncident(mergeReq, { params });
    expect(mergeRes.status).toBe(200);
  });
});
