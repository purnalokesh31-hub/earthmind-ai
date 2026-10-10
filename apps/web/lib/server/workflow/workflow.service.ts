// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Enterprise Evidence Processing Workflow Engine
// Orchestrates: Upload → Virus Scan → OCR → Metadata → AI → Notification → Audit
// ──────────────────────────────────────────────────────────────

import { logger } from '../logger';
import { EventBus, eventBus as defaultEventBus } from '../events/event-bus.service';

export type WorkflowStep =
  | 'EVIDENCE_UPLOADED'
  | 'VIRUS_SCAN'
  | 'OCR'
  | 'METADATA'
  | 'AI'
  | 'NOTIFICATION'
  | 'AUDIT'
  | 'COMPLETED'
  | 'FAILED';

export interface WorkflowInstance {
  workflowId: string;
  evidenceId: string;
  currentStep: WorkflowStep;
  completedSteps: WorkflowStep[];
  status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  startedAt: Date;
  completedAt?: Date;
}

export class WorkflowService {
  private workflows: Map<string, WorkflowInstance> = new Map();

  constructor(private readonly bus: EventBus = defaultEventBus) {}

  async startWorkflow(evidenceId: string): Promise<WorkflowInstance> {
    const workflowId = `wf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const instance: WorkflowInstance = {
      workflowId,
      evidenceId,
      currentStep: 'EVIDENCE_UPLOADED',
      completedSteps: [],
      status: 'IN_PROGRESS',
      startedAt: new Date(),
    };

    this.workflows.set(workflowId, instance);
    logger.info(`[WorkflowService] Started evidence processing workflow '${workflowId}' for evidence '${evidenceId}'`);

    await this.bus.publish('WORKFLOW_STARTED', { workflowId, evidenceId });
    return instance;
  }

  async advanceStep(workflowId: string, nextStep: WorkflowStep): Promise<WorkflowInstance> {
    const instance = this.workflows.get(workflowId);
    if (!instance) throw new Error(`Workflow '${workflowId}' not found`);

    instance.completedSteps.push(instance.currentStep);
    instance.currentStep = nextStep;

    if (nextStep === 'COMPLETED') {
      instance.status = 'COMPLETED';
      instance.completedAt = new Date();
      logger.info(`[WorkflowService] Workflow '${workflowId}' COMPLETED successfully`);
    } else if (nextStep === 'FAILED') {
      instance.status = 'FAILED';
      logger.error(`[WorkflowService] Workflow '${workflowId}' FAILED`);
    }

    return instance;
  }

  getWorkflow(workflowId: string): WorkflowInstance | null {
    return this.workflows.get(workflowId) || null;
  }
}

export const workflowService = new WorkflowService();
