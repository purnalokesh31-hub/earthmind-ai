// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — TASK 16: Incident Merge Verification Suite
// Validates Domain-Aware Merging of Evidence, Timeline, Descriptions, Statuses, and Rejection of Invalid Merges
// ──────────────────────────────────────────────────────────────

import { describe, it, expect, beforeEach } from 'vitest';
import { IncidentService } from '@/lib/server/services/incident.service';
import { MockIncidentRepository } from '../mocks/mock-incident.repository';
import { MockEvidenceRepository } from '../mocks/mock-evidence.repository';
import { IAuditRepository, AuditLogEntity } from '@/lib/server/repositories/audit.repository';
import { ITimelineService, CreateTimelineEventDto, TimelineEventDto } from '@/lib/server/services/timeline.service';
import { InMemoryEventBus } from '@/lib/server/events/event-bus';

class MockAuditRepo implements IAuditRepository {
  public logs: AuditLogEntity[] = [];

  async logEvent(event: any): Promise<AuditLogEntity> {
    const item: AuditLogEntity = {
      id: `audit-${Date.now()}-${Math.random()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...event,
    };
    this.logs.push(item);
    return item;
  }

  async findByIncidentId(incidentId: string): Promise<AuditLogEntity[]> {
    return this.logs.filter((l) => l.targetId === incidentId);
  }

  async findByUserId(userId: string): Promise<AuditLogEntity[]> {
    return this.logs.filter((l) => l.actorId === userId);
  }

  async findByActor(actorId: string): Promise<AuditLogEntity[]> {
    return this.logs.filter((l) => l.actorId === actorId);
  }

  async findByCategory(category: string): Promise<AuditLogEntity[]> {
    return this.logs.filter((l) => l.category === category);
  }

  async findByTarget(targetId: string): Promise<any[]> {
    return this.logs.filter((l) => l.targetId === targetId);
  }

  async findByAction(action: string): Promise<AuditLogEntity[]> {
    return this.logs.filter((l) => l.action === action);
  }

  async findByDateRange(from: Date, to: Date): Promise<AuditLogEntity[]> {
    return this.logs.filter((l) => l.createdAt >= from && l.createdAt <= to);
  }

  async findById(id: string): Promise<AuditLogEntity | null> {
    return this.logs.find((l) => l.id === id) || null;
  }

  async findAll(): Promise<AuditLogEntity[]> {
    return this.logs;
  }

  async create(data: any): Promise<AuditLogEntity> {
    return this.logEvent(data);
  }

  async update(id: string, data: any): Promise<AuditLogEntity> {
    const existing = await this.findById(id);
    if (!existing) throw new Error('Not found');
    Object.assign(existing, data);
    return existing;
  }

  async delete(id: string): Promise<boolean> {
    const idx = this.logs.findIndex((l) => l.id === id);
    if (idx >= 0) {
      this.logs.splice(idx, 1);
      return true;
    }
    return false;
  }

  async count(): Promise<number> {
    return this.logs.length;
  }
}

class MockTimelineService implements ITimelineService {
  public events: TimelineEventDto[] = [];

  async recordEvent(dto: CreateTimelineEventDto): Promise<TimelineEventDto> {
    const event: TimelineEventDto = {
      id: `tl-${Date.now()}-${Math.random()}`,
      incidentId: dto.incidentId,
      action: dto.action,
      actorId: dto.actorId || null,
      previousStatus: dto.previousStatus || null,
      newStatus: dto.newStatus || null,
      note: dto.note || null,
      metadata: dto.metadata || null,
      createdAt: new Date().toISOString(),
    };
    this.events.push(event);
    return event;
  }

  async getTimelineForIncident(incidentId: string): Promise<TimelineEventDto[]> {
    return this.events.filter((e) => e.incidentId === incidentId);
  }
}

describe('TASK 16 — Domain-Aware Incident Merge Verification Suite', () => {
  let incidentRepo: MockIncidentRepository;
  let evidenceRepo: MockEvidenceRepository;
  let auditRepo: MockAuditRepo;
  let timelineService: MockTimelineService;
  let eventBus: InMemoryEventBus;
  let incidentService: IncidentService;

  beforeEach(() => {
    incidentRepo = new MockIncidentRepository();
    evidenceRepo = new MockEvidenceRepository();
    auditRepo = new MockAuditRepo();
    timelineService = new MockTimelineService();
    eventBus = new InMemoryEventBus();

    incidentService = new IncidentService(
      incidentRepo,
      evidenceRepo,
      auditRepo,
      undefined,
      timelineService,
      eventBus
    );
  });

  describe('1. Successful Domain-Aware Merge & Evidence Transfer', () => {
    it('merges duplicate incident into primary, transferring evidence and enriching description', async () => {
      // 1. Create Primary Incident
      const primary = await incidentRepo.create({
        title: 'Benz Circle Waterlog',
        description: 'Severe waterlogging blocking traffic on main road.',
        status: 'VERIFIED',
        severity: 'HIGH',
        category: 'FLOOD',
        department: 'DRAINAGE',
        riskScore: 70,
        locationName: 'Benz Circle',
      });

      // 2. Create Duplicate Incident with Evidence
      const duplicate = await incidentRepo.create({
        title: 'Benz Circle Sluice Overflow',
        description: 'Citizen reports water overflowing from storm drain.',
        status: 'REPORTED',
        severity: 'CRITICAL',
        category: 'FLOOD',
        department: 'DRAINAGE',
        riskScore: 85,
        locationName: 'Benz Circle Junction',
      });

      const ev1 = await evidenceRepo.create({
        fileName: 'overflow_drain.jpg',
        fileType: 'image',
        mimeType: 'image/jpeg',
        sizeBytes: 1024,
        storageUrl: 'https://storage.earthmind.test/overflow_drain.jpg',
        status: 'analyzed',
        linkedIncidentId: duplicate.id,
      });

      const ev2 = await evidenceRepo.create({
        fileName: 'radar_telemetry.json',
        fileType: 'sensor',
        mimeType: 'application/json',
        sizeBytes: 512,
        storageUrl: 'https://storage.earthmind.test/radar.json',
        status: 'analyzed',
        linkedIncidentId: duplicate.id,
      });

      // 3. Execute Merge
      const result = await incidentService.mergeIncident(primary.id, duplicate.id, 'usr-commander-01');

      // Verify Primary state
      expect(result.id).toBe(primary.id);
      expect(result.description).toContain('[Merged from');
      expect(result.description).toContain(duplicate.description);
      expect(result.riskScore).toBe(85); // Takes maximum risk score

      // Verify Evidence was transferred to Primary
      const transferredEv1 = await evidenceRepo.findById(ev1.id);
      const transferredEv2 = await evidenceRepo.findById(ev2.id);
      expect(transferredEv1?.linkedIncidentId).toBe(primary.id);
      expect(transferredEv2?.linkedIncidentId).toBe(primary.id);

      // Verify Duplicate is Archived
      const archivedDuplicate = await incidentRepo.findById(duplicate.id);
      expect(archivedDuplicate?.status).toBe('ARCHIVED');

      // Verify Audit Logs
      const auditLogs = await auditRepo.findAll();
      expect(auditLogs.some((l) => l.action === 'INCIDENT_MERGED' && l.targetId === primary.id)).toBe(true);
      expect(auditLogs.some((l) => l.action === 'INCIDENT_MERGED_AND_ARCHIVED' && l.targetId === duplicate.id)).toBe(true);
    });
  });

  describe('2. Prevention of Invalid Merges', () => {
    it('rejects merging an incident into itself', async () => {
      const inc = await incidentRepo.create({
        title: 'Single Incident',
        description: 'Single incident description.',
        status: 'VERIFIED',
        severity: 'MEDIUM',
        category: 'INFRASTRUCTURE',
        department: 'ROADS',
        riskScore: 50,
        locationName: 'MG Road',
      });

      await expect(
        incidentService.mergeIncident(inc.id, inc.id, 'usr-op-01')
      ).rejects.toThrow('Cannot merge an incident into itself');
    });

    it('rejects merge when primary incident does not exist', async () => {
      const duplicate = await incidentRepo.create({
        title: 'Duplicate Incident',
        description: 'Desc',
        status: 'REPORTED',
        severity: 'LOW',
        category: 'OTHER',
        department: 'OPS',
        riskScore: 30,
        locationName: 'Sector 4',
      });

      await expect(
        incidentService.mergeIncident('nonexistent-primary-id', duplicate.id, 'usr-op-01')
      ).rejects.toThrow(/not found/);
    });

    it('rejects merge when duplicate incident is already archived', async () => {
      const primary = await incidentRepo.create({
        title: 'Active Primary',
        description: 'Desc 1',
        status: 'VERIFIED',
        severity: 'MEDIUM',
        category: 'TRAFFIC',
        department: 'TRAFFIC',
        riskScore: 40,
        locationName: 'Bus Terminal',
      });

      const alreadyArchived = await incidentRepo.create({
        title: 'Archived Duplicate',
        description: 'Desc 2',
        status: 'ARCHIVED',
        severity: 'LOW',
        category: 'TRAFFIC',
        department: 'TRAFFIC',
        riskScore: 20,
        locationName: 'Bus Terminal',
      });

      await expect(
        incidentService.mergeIncident(primary.id, alreadyArchived.id, 'usr-op-01')
      ).rejects.toThrow('Duplicate incident');
    });
  });
});
