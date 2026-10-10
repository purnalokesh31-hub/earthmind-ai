import { describe, it, expect } from 'vitest';
import { executeInTransaction, createIncidentTransaction } from '../../lib/server/database/transaction';

describe('Phase 6.2.6 — Transaction Layer Verification', () => {
  it('should export executeInTransaction and transaction helpers', () => {
    expect(executeInTransaction).toBeDefined();
    expect(typeof executeInTransaction).toBe('function');
    expect(createIncidentTransaction).toBeDefined();
    expect(typeof createIncidentTransaction).toBe('function');
  });

  it('should handle transaction execution callback cleanly', async () => {
    // Mock Prisma Client for transaction test
    const mockTx = {
      incident: {
        create: async (args: any) => ({
          id: 'INC-tx-123',
          incidentCode: 'EM-101',
          ...args.data,
        }),
      },
      incidentTimeline: {
        create: async () => ({ id: 'tl-1' }),
      },
      notification: {
        create: async () => ({ id: 'notif-1' }),
      },
      auditLog: {
        create: async () => ({ id: 'aud-1' }),
      },
    };

    const mockPrisma: any = {
      $transaction: async (fn: any) => fn(mockTx),
    };

    const incident = await createIncidentTransaction(
      {
        title: 'Bridge Structural Defect',
        description: 'Cracks observed on support pillar 4',
        category: 'Infrastructure',
        department: 'Public Works',
        locationName: 'Sector 9 Bridge',
        createdById: 'usr-officer-1',
        assignedOfficerId: 'usr-supervisor-2',
        severity: 'CRITICAL',
      },
      mockPrisma
    );

    expect(incident.id).toBe('INC-tx-123');
    expect(incident.title).toBe('Bridge Structural Defect');
    expect(incident.severity).toBe('CRITICAL');
  });
});
