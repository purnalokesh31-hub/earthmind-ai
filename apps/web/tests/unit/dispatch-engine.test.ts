// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 6.7 Autonomous Dispatch Unit & Integration Specs
// ──────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { DispatchEntity } from '../../lib/domain/dispatch/dispatch.entity';
import { isValidDispatchStatusTransition } from '../../lib/domain/dispatch/dispatch-status';
import { CreateDispatchSchema } from '../../lib/domain/dispatch/dispatch.validator';
import { assignmentEngine } from '../../lib/server/dispatch/assignment-engine';
import { slaEngine } from '../../lib/server/dispatch/sla-engine';
import { escalationEngine } from '../../lib/server/dispatch/escalation-engine';
import { dispatchOrchestrator } from '../../lib/server/dispatch/dispatch-orchestrator';
import { dispatchNotificationService } from '../../lib/server/notifications/dispatch-notification.service';
import { prismaDispatchRepository } from '../../lib/server/repositories/dispatch.repository';
import { dispatchService } from '../../lib/server/services/dispatch.service';
import { CoordinationEntity } from '../../lib/domain/coordination/coordination.entity';
import { dispatchMetricsService } from '../../lib/server/monitoring/dispatch-metrics.service';

describe('Phase 6.7 — Autonomous Incident Dispatch Engine Master Suite', () => {
  // ── 1. Domain Entity & State Transitions ──
  it('should create DispatchEntity and allow valid status transitions', () => {
    const dispatch = new DispatchEntity({
      id: 'disp-test-1',
      incidentId: 'inc-test-1',
      priority: 'HIGH',
      status: 'PENDING',
      dispatchReason: 'AI Road Collapse Hazard',
      assignedAt: new Date(),
      escalationLevel: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(dispatch.status).toBe('PENDING');

    const assignResult = dispatch.assignOfficer('usr-officer-1', 'dept-pwd-1');
    expect(assignResult.success).toBe(true);
    expect(dispatch.status).toBe('ASSIGNED');

    const ackResult = dispatch.acknowledge();
    expect(ackResult.success).toBe(true);
    expect(dispatch.status).toBe('ACKNOWLEDGED');

    const routeResult = dispatch.markEnRoute();
    expect(routeResult.success).toBe(true);

    const sceneResult = dispatch.markOnScene();
    expect(sceneResult.success).toBe(true);

    const resolveResult = dispatch.resolve();
    expect(resolveResult.success).toBe(true);
    expect(dispatch.status).toBe('RESOLVED');
  });

  it('should reject invalid state transitions', () => {
    expect(isValidDispatchStatusTransition('PENDING', 'RESOLVED')).toBe(false);
    expect(isValidDispatchStatusTransition('CANCELLED', 'ASSIGNED')).toBe(false);
  });

  // ── 2. Zod Validation Schemas ──
  it('should validate dispatch creation schema correctly', () => {
    const valid = CreateDispatchSchema.safeParse({
      incidentId: '123e4567-e89b-12d3-a456-426614174000',
      priority: 'CRITICAL',
      dispatchReason: 'Severe P1 Infrastructure Crisis',
    });
    expect(valid.success).toBe(true);

    const invalid = CreateDispatchSchema.safeParse({
      incidentId: 'invalid-uuid',
      dispatchReason: 'short',
    });
    expect(invalid.success).toBe(false);
  });

  // ── 3. Autonomous Assignment Engine ──
  it('should recommend best responder based on proximity, workload, & skills', () => {
    const recommendation = assignmentEngine.recommendBestResponder(
      {
        incidentId: 'inc-p1',
        category: 'ROAD_DAMAGE',
        severity: 'CRITICAL',
        latitude: 16.5060,
        longitude: 80.6350,
        departmentId: 'dept-pwd',
      },
      [
        {
          id: 'off-far',
          fullName: 'Officer Far',
          departmentId: 'dept-pwd',
          role: 'FIELD_OFFICER',
          skills: ['INFRASTRUCTURE'],
          currentLatitude: 16.6000,
          currentLongitude: 80.7000,
          activeAssignmentsCount: 4,
          isAvailable: true,
        },
        {
          id: 'off-near',
          fullName: 'Officer Near',
          departmentId: 'dept-pwd',
          role: 'FIELD_OFFICER',
          skills: ['INFRASTRUCTURE', 'HAZMAT'],
          currentLatitude: 16.5070,
          currentLongitude: 80.6360,
          activeAssignmentsCount: 0,
          isAvailable: true,
        },
      ]
    );

    expect(recommendation).not.toBeNull();
    expect(recommendation?.officerId).toBe('off-near');
    expect(recommendation?.score).toBeGreaterThan(80);
    expect(recommendation?.reasons.length).toBeGreaterThan(0);
  });

  // ── 4. SLA & Priority Engine ──
  it('should calculate deterministic SLA deadlines for CRITICAL and LOW priority', () => {
    const criticalSla = slaEngine.calculateDeadlines('CRITICAL');
    expect(criticalSla.acknowledgementDeadline.getTime()).toBeGreaterThan(Date.now());
    expect(criticalSla.priority).toBe('CRITICAL');

    const lowSla = slaEngine.calculateDeadlines('LOW');
    expect(lowSla.responseDeadline.getTime() - Date.now()).toBeGreaterThan(12 * 3600000);
  });

  // ── 5. Escalation Engine ──
  it('should escalate dispatch through level 0 to level 4 chain', () => {
    const dispatch = new DispatchEntity({
      id: 'disp-esc-1',
      incidentId: 'inc-esc-1',
      priority: 'CRITICAL',
      status: 'ASSIGNED',
      dispatchReason: 'Unacknowledged P1 incident',
      assignedAt: new Date(),
      escalationLevel: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const esc1 = escalationEngine.evaluateEscalation(dispatch, 'Officer SLA Breach');
    expect(esc1.newLevel).toBe(1);
    expect(esc1.levelName).toBe('LEVEL_1_SUPERVISOR');
    expect(dispatch.escalationLevel).toBe(1);
  });

  // ── 6. Multi-Agency Coordination Entity ──
  it('should manage multi-agency participating agencies and status tracking', () => {
    const coord = new CoordinationEntity({
      coordinationId: 'coord-1',
      incidentId: 'inc-flood-1',
      primaryDepartmentId: 'dept-disaster',
      participatingAgencies: [
        {
          id: 'part-1',
          dispatchId: 'disp-1',
          incidentId: 'inc-flood-1',
          departmentId: 'dept-pwd',
          departmentName: 'Public Works',
          isPrimary: false,
          responsibility: 'Road Clearance',
          status: 'JOINED',
          createdAt: new Date(),
        },
      ],
      sharedContext: { floodZone: 'Ward 12' },
      isSynchronized: true,
      createdAt: new Date(),
    });

    expect(coord.participatingAgencies.length).toBe(1);
    const ackSuccess = coord.acknowledgeAgency('dept-pwd');
    expect(ackSuccess).toBe(true);
    expect(coord.participatingAgencies[0].status).toBe('ACKNOWLEDGED');
  });

  // ── 7. Idempotent Dispatch Workflow Orchestrator ──
  it('should process dispatch idempotently without creating duplicates', async () => {
    const result1 = await dispatchOrchestrator.processAutonomousDispatch(
      'inc-idemp-101',
      'POTHOLE',
      'HIGH',
      16.5060,
      80.6350,
      'dept-pwd',
      [],
      'key-unique-123'
    );

    expect(result1.isDuplicate).toBe(false);

    const result2 = await dispatchOrchestrator.processAutonomousDispatch(
      'inc-idemp-101',
      'POTHOLE',
      'HIGH',
      16.5060,
      80.6350,
      'dept-pwd',
      [],
      'key-unique-123'
    );

    expect(result2.isDuplicate).toBe(true);
  });

  // ── 8. Multi-Channel Notification Service ──
  it('should send multi-channel notifications cleanly', async () => {
    const results = await dispatchNotificationService.dispatchNotification({
      notificationId: 'notif-spec-1',
      recipientId: 'usr-officer-1',
      recipientEmail: 'officer@earthmind.gov',
      title: 'Dispatch Assignment',
      message: 'Immediate response required',
      priority: 'CRITICAL',
      channels: ['EMAIL', 'PUSH'],
    });

    expect(results.length).toBe(2);
    expect(results.every((r) => r.status === 'SENT')).toBe(true);
  });

  // ── 9. Repository Operations ──
  it('should create and retrieve dispatch via PrismaDispatchRepository', async () => {
    const created = await prismaDispatchRepository.create({
      incidentId: 'inc-repo-1',
      priority: 'MEDIUM',
      status: 'PENDING',
      dispatchReason: 'Repository Integration Spec',
      assignedAt: new Date(),
      escalationLevel: 0,
    });

    expect(created.id).toBeDefined();
    const fetched = await prismaDispatchRepository.findById(created.id);
    expect(fetched?.incidentId).toBe('inc-repo-1');
  });

  // ── 10. Application Service Lifecycle ──
  it('should manage full dispatch lifecycle via DispatchService', async () => {
    const created = await dispatchService.createDispatch({
      incidentId: '123e4567-e89b-12d3-a456-426614174001',
      assignedOfficerId: '123e4567-e89b-12d3-a456-426614174002',
      priority: 'HIGH',
      dispatchReason: 'Full Lifecycle Integration Test',
    });

    expect(created.status).toBe('ASSIGNED');

    const ack = await dispatchService.acknowledgeDispatch(created.id, 'Officer en route');
    expect(ack.status).toBe('ACKNOWLEDGED');

    const scene = await dispatchService.markOnScene(created.id);
    expect(scene.status).toBe('ON_SCENE');

    const resolved = await dispatchService.resolveDispatch(created.id);
    expect(resolved.status).toBe('RESOLVED');
  });

  // ── 11. Prometheus Metrics ──
  it('should generate Prometheus metrics string', () => {
    dispatchMetricsService.recordDispatchCreated();
    const metrics = dispatchMetricsService.generatePrometheusMetrics();
    expect(metrics).toContain('earthmind_dispatch_requests_total');
    expect(metrics).toContain('earthmind_dispatch_active_total');
  });
});
