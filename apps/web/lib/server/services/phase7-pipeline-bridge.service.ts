// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7 Pipeline Bridge Service
// Read-Only Telemetry Runtime to Phase 7 Intelligence Pipeline Bridge
// ──────────────────────────────────────────────────────────────

import { cityIntelligenceRuntimeService } from './city-intelligence-runtime.service';
import { cityGovernanceEvaluationService } from './city-governance-evaluation.service';
import { cityCommandDecisionService } from './city-command-decision.service';

export interface UnifiedPipelineContext {
  pipelineRunId: string;
  cityId: string;
  timestamp: string;
  executionMode: 'LIVE_READ_ONLY' | 'DEMO' | 'SIMULATION';
  currentStage: string;
  stageHistory: any[];
  telemetrySnapshot?: any;
  telemetryTrust?: any;
  dataQuality?: any;
  provenance?: any;
  correlationResult?: any;
  predictionResult?: any;
  simulationResult?: any;
  decisionResult?: any;
  interventionResult?: any;
  governanceResult?: any;
  approvalStatus?: 'AWAITING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'BLOCKED';
  warnings: string[];
  blockedReasons: string[];
  requiresHumanApproval: true;
  advisoryOnly: true;
  autonomousExecution: false;
}

export class Phase7PipelineBridgeService {
  private pipelineStore = new Map<string, UnifiedPipelineContext>();

  public async runUnifiedPipeline(
    cityId: string = 'city-vja',
    executionMode: 'LIVE_READ_ONLY' | 'DEMO' | 'SIMULATION' = 'LIVE_READ_ONLY'
  ): Promise<UnifiedPipelineContext> {
    const pipelineRunId = `run-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const result = await cityIntelligenceRuntimeService.executePipeline({ cityId, executionMode });

    const context: UnifiedPipelineContext = {
      pipelineRunId,
      cityId,
      timestamp: new Date().toISOString(),
      executionMode,
      currentStage: 'STAGE_8_HUMAN_GOVERNANCE',
      stageHistory: result.pipelineStages || [],
      telemetryTrust: result.telemetryTrust,
      correlationResult: result.correlationResult,
      predictionResult: result.predictiveRisk,
      simulationResult: result.scenarioSimulation,
      decisionResult: result.decisionOptimization,
      interventionResult: result.interventionPlan,
      governanceResult: result.governanceApproval,
      approvalStatus: 'AWAITING_APPROVAL',
      warnings: [],
      blockedReasons: [],
      requiresHumanApproval: true,
      advisoryOnly: true,
      autonomousExecution: false,
    };

    this.pipelineStore.set(pipelineRunId, context);
    return context;
  }

  public getPipelineContext(pipelineRunId: string): UnifiedPipelineContext | null {
    return this.pipelineStore.get(pipelineRunId) || null;
  }

  public listPipelines(): UnifiedPipelineContext[] {
    return Array.from(this.pipelineStore.values());
  }

  public getPipelineStages(pipelineRunId: string): any[] {
    const ctx = this.getPipelineContext(pipelineRunId);
    return ctx ? ctx.stageHistory : [];
  }

  public getPipelineGovernance(pipelineRunId: string): any {
    const ctx = this.getPipelineContext(pipelineRunId);
    return ctx ? ctx.governanceResult : null;
  }

  public recordHumanApproval(
    pipelineRunId: string,
    userId: string,
    operatorNotes?: string
  ): UnifiedPipelineContext {
    const ctx = this.getPipelineContext(pipelineRunId);
    if (!ctx) throw new Error(`PIPELINE_NOT_FOUND: Pipeline run '${pipelineRunId}' not found.`);

    if (ctx.approvalStatus === 'APPROVED' || ctx.approvalStatus === 'REJECTED') {
      throw new Error(`DUPLICATE_DECISION_BLOCKED: Decision for pipeline '${pipelineRunId}' has already been recorded (${ctx.approvalStatus}).`);
    }

    ctx.approvalStatus = 'APPROVED';
    ctx.currentStage = 'STAGE_9_OPERATOR_APPROVAL';
    ctx.stageHistory.push({
      stageId: 'stage-9-approval',
      stageName: 'Phase 7.11 Human Operator Approval',
      status: 'APPROVED',
      provenance: 'HUMAN_COMMANDER',
      details: `Approved by operator '${userId}'. Notes: ${operatorNotes || 'None'}`,
      timestamp: new Date().toISOString(),
    });

    return ctx;
  }

  public recordHumanRejection(
    pipelineRunId: string,
    userId: string,
    operatorNotes?: string
  ): UnifiedPipelineContext {
    const ctx = this.getPipelineContext(pipelineRunId);
    if (!ctx) throw new Error(`PIPELINE_NOT_FOUND: Pipeline run '${pipelineRunId}' not found.`);

    if (ctx.approvalStatus === 'APPROVED' || ctx.approvalStatus === 'REJECTED') {
      throw new Error(`DUPLICATE_DECISION_BLOCKED: Decision for pipeline '${pipelineRunId}' has already been recorded (${ctx.approvalStatus}).`);
    }

    ctx.approvalStatus = 'REJECTED';
    ctx.currentStage = 'STAGE_9_OPERATOR_APPROVAL';
    ctx.stageHistory.push({
      stageId: 'stage-9-approval',
      stageName: 'Phase 7.11 Human Operator Approval',
      status: 'REJECTED',
      provenance: 'HUMAN_COMMANDER',
      details: `Rejected by operator '${userId}'. Notes: ${operatorNotes || 'None'}`,
      timestamp: new Date().toISOString(),
    });

    return ctx;
  }
}

export const phase7PipelineBridgeService = new Phase7PipelineBridgeService();
