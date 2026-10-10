import { describe, it, expect } from 'vitest';
import { EventBus, MemoryEventBusAdapter } from '../../lib/server/events/event-bus.service';
import { workflowService } from '../../lib/server/workflow/workflow.service';

describe('Phase 6.5.7 — Distributed Event Bus & Workflow Platform', () => {
  // ── Distributed Event Bus ──
  describe('Event Bus & Multi-Adapter Messaging System', () => {
    it('should publish domain events to subscribed handlers', async () => {
      const bus = new EventBus(new MemoryEventBusAdapter());
      let receivedPayload: any = null;

      bus.subscribe('EVIDENCE_VIRUS_SCAN_PASSED', async (event) => {
        receivedPayload = event.payload;
      });

      await bus.publish('EVIDENCE_VIRUS_SCAN_PASSED', { evidenceId: 'evd-bus-101', status: 'CLEAN' });
      expect(receivedPayload).toEqual({ evidenceId: 'evd-bus-101', status: 'CLEAN' });
    });

    it('should prevent duplicate event execution using idempotency keys', async () => {
      const bus = new EventBus(new MemoryEventBusAdapter());
      const idempotencyKey = 'idem-key-unique-999';

      await bus.publish('EVIDENCE_OCR_TRIGGERED', { evidenceId: 'evd-101' }, idempotencyKey);
      await expect(bus.publish('EVIDENCE_OCR_TRIGGERED', { evidenceId: 'evd-101' }, idempotencyKey)).rejects.toThrow(
        'Duplicate event execution prevented'
      );
    });

    it('should allow publishing events with auto-generated idempotency keys', async () => {
      const bus = new EventBus(new MemoryEventBusAdapter());
      const event = await bus.publish('EVIDENCE_THUMBNAIL_CREATED', { evidenceId: 'evd-102' });
      expect(event.eventId).toContain('evt-');
      expect(event.idempotencyKey).toContain('evt-');
    });
  });

  // ── Workflow Engine ──
  describe('Evidence Processing Workflow Engine', () => {
    it('should start an evidence processing workflow DAG', async () => {
      const wf = await workflowService.startWorkflow('evd-wf-500');
      expect(wf.workflowId).toContain('wf-');
      expect(wf.evidenceId).toBe('evd-wf-500');
      expect(wf.currentStep).toBe('EVIDENCE_UPLOADED');
      expect(wf.status).toBe('IN_PROGRESS');
    });

    it('should advance workflow steps from Uploaded -> Virus Scan -> OCR -> AI -> Notification -> Completed', async () => {
      const wf = await workflowService.startWorkflow('evd-wf-501');

      await workflowService.advanceStep(wf.workflowId, 'VIRUS_SCAN');
      await workflowService.advanceStep(wf.workflowId, 'OCR');
      await workflowService.advanceStep(wf.workflowId, 'METADATA');
      await workflowService.advanceStep(wf.workflowId, 'AI');
      await workflowService.advanceStep(wf.workflowId, 'NOTIFICATION');
      await workflowService.advanceStep(wf.workflowId, 'AUDIT');
      const finalWf = await workflowService.advanceStep(wf.workflowId, 'COMPLETED');

      expect(finalWf.status).toBe('COMPLETED');
      expect(finalWf.completedSteps).toContain('EVIDENCE_UPLOADED');
      expect(finalWf.completedSteps).toContain('VIRUS_SCAN');
      expect(finalWf.completedSteps).toContain('OCR');
      expect(finalWf.completedSteps).toContain('METADATA');
      expect(finalWf.completedSteps).toContain('AI');
      expect(finalWf.completedSteps).toContain('NOTIFICATION');
      expect(finalWf.completedSteps).toContain('AUDIT');
    });

    it('should transition workflow to FAILED state upon error', async () => {
      const wf = await workflowService.startWorkflow('evd-wf-502');
      const failedWf = await workflowService.advanceStep(wf.workflowId, 'FAILED');
      expect(failedWf.status).toBe('FAILED');
    });

    it('should throw error when advancing non-existent workflow', async () => {
      await expect(workflowService.advanceStep('non-existent-id', 'VIRUS_SCAN')).rejects.toThrow('not found');
    });
  });
});
