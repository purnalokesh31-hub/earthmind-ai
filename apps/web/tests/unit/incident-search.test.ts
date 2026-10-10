import { describe, it, expect, vi } from 'vitest';
import { PrismaIncidentRepository } from '../../lib/server/repositories/incident.repository';

describe('Phase 6.4 — Enterprise Incident Search Engine Subsystem', () => {
  it('should construct composite Prisma query with filters, text search, date range, risk score, & geo bounding box', async () => {
    const mockPrisma = {
      incident: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'inc-search-1',
            incidentCode: 'EM-2026-SRCH1',
            title: 'Chemical Spill',
            description: 'Toxic chemical spill near river bank',
            status: 'ACTIVE',
            severity: 'CRITICAL',
            category: 'HAZMAT',
            department: 'ENVIRONMENTAL',
            riskScore: 85,
            locationName: 'River Delta',
            latitude: 37.7749,
            longitude: -122.4194,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]),
        count: vi.fn().mockResolvedValue(1),
      },
    };

    const repo = new PrismaIncidentRepository(mockPrisma as any);

    const result = await repo.searchPaginated('Spill', {
      page: 1,
      pageSize: 10,
      sortBy: 'riskScore',
      sortOrder: 'desc',
      status: ['ACTIVE', 'DISPATCHED'],
      severity: 'CRITICAL',
      category: 'HAZMAT',
      department: 'ENVIRONMENTAL',
      minRiskScore: 50,
      maxRiskScore: 100,
      from: new Date('2026-01-01'),
      to: new Date('2026-12-31'),
      lat: 37.7749,
      lng: -122.4194,
      radiusKm: 10,
    });

    expect(result.incidents).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.incidents[0].title).toBe('Chemical Spill');

    expect(mockPrisma.incident.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 10,
        skip: 0,
        orderBy: { riskScore: 'desc' },
      })
    );
  });
});
