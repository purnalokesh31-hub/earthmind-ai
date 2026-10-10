import { describe, it, expect } from 'vitest';
import container, { TOKENS } from '../../lib/server/container';
import { MockIncidentRepository } from '../mocks/mock-incident.repository';
import { MockUserRepository } from '../mocks/mock-user.repository';

describe('Phase 6.1.15 — Architecture & Testing Environment Verification', () => {
  it('should initialize Vitest suite successfully', () => {
    expect(true).toBe(true);
  });

  it('should resolve DI container tokens cleanly', () => {
    const userRepo = container.resolve(TOKENS.UserRepository);
    expect(userRepo).toBeDefined();

    const incidentRepo = container.resolve(TOKENS.IncidentRepository);
    expect(incidentRepo).toBeDefined();
  });

  it('should instantiate MockIncidentRepository and perform CRUD operations', async () => {
    const mockRepo = new MockIncidentRepository();
    const created = await mockRepo.create({
      title: 'Mock Infrastructure Damage',
      description: 'Test incident for verification',
      status: 'active',
      severity: 'high',
      category: 'Infrastructure',
      department: 'Public Works',
      riskScore: 75,
      locationName: 'District 4',
    });

    expect(created.id).toContain('INC-mock-');
    expect(created.title).toBe('Mock Infrastructure Damage');

    const fetched = await mockRepo.findById(created.id);
    expect(fetched).toEqual(created);
  });

  it('should instantiate MockUserRepository and manage users', async () => {
    const mockRepo = new MockUserRepository();
    const user = await mockRepo.create({
      email: 'commander@earthmind.gov',
      passwordHash: 'hashed-password',
      fullName: 'System Commander',
      role: 'COMMANDER',
      isActive: true,
    });

    expect(user.email).toBe('commander@earthmind.gov');
    const found = await mockRepo.findByEmail('commander@earthmind.gov');
    expect(found?.id).toBe(user.id);
  });
});
