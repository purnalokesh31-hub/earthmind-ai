// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Dedicated Demo Mode Service & State Manager
// Provides expo-ready interactive simulation control & 9-stage stepper
// ──────────────────────────────────────────────────────────────

import { cityCrisisDemoService, CityCrisisDemoScenarioResultDto } from './city-crisis-demo.service';
import { earthMindSafetyGatewayService } from '../services/earthmind-safety-gateway.service';
import { logger } from '../logger';

export type DemoModeState = 'IDLE' | 'RUNNING' | 'COMPLETED' | 'RESET';

export type DemoStageId =
  | 'SIGNAL_DETECTED'
  | 'CROSS_DOMAIN_CORRELATION'
  | 'RISK_PREDICTION'
  | 'WHAT_IF_SIMULATION'
  | 'DECISION_PRIORITY'
  | 'INTERVENTION_PLAN'
  | 'COMMAND_ESCALATION'
  | 'HUMAN_AUTHORIZATION'
  | 'AUDIT_COMPLETE';

export type DemoStageStatus = 'COMPLETED' | 'ACTIVE' | 'PENDING' | 'BLOCKED_BY_AUTHORIZATION';

export interface DemoStageProgressDto {
  stageId: DemoStageId;
  stepNumber: number;
  label: string;
  description: string;
  status: DemoStageStatus;
  detailSummary?: string;
}

export interface DemoModeStatusDto {
  mode: 'DEMO_MODE';
  scenarioId: 'CITY_FLOOD_CASCADE_DEMO';
  scenarioTitle: string;
  state: DemoModeState;
  executedAt?: string;
  dataSource: 'SIMULATION';
  safetyBanners: {
    demoMode: 'DEMO MODE';
    simulationData: 'SIMULATION DATA';
    noLiveControl: 'NO LIVE INFRASTRUCTURE CONTROL';
    humanAuthRequired: 'HUMAN AUTHORIZATION REQUIRED';
  };
  stages: DemoStageProgressDto[];
  metrics?: any;
  result?: CityCrisisDemoScenarioResultDto;
  safetyGovernance: {
    requiresHumanApproval: true;
    advisoryOnly: true;
    autonomousExecution: false;
  };
}

export class DemoModeService {
  private currentState: DemoModeState = 'IDLE';
  private lastResult?: CityCrisisDemoScenarioResultDto;

  public getDemoState(): DemoModeStatusDto {
    const isCompleted = this.currentState === 'COMPLETED' && Boolean(this.lastResult);
    const isRunning = this.currentState === 'RUNNING';

    const stages: DemoStageProgressDto[] = [
      {
        stageId: 'SIGNAL_DETECTED',
        stepNumber: 1,
        label: 'SIGNAL DETECTED',
        description: 'Multi-domain climate telemetry (Rainfall 145 mm/hr)',
        status: isCompleted ? 'COMPLETED' : isRunning ? 'ACTIVE' : 'PENDING',
        detailSummary: isCompleted ? 'Rainfall 145.0 mm/hr detected in Benz Circle catchment' : undefined,
      },
      {
        stageId: 'CROSS_DOMAIN_CORRELATION',
        stepNumber: 2,
        label: 'CROSS-DOMAIN CORRELATION',
        description: 'Causal cascade correlation across Climate, Mobility, Transit, Emergency',
        status: isCompleted ? 'COMPLETED' : 'PENDING',
        detailSummary: isCompleted ? 'Confidence: 94.5% across 4 domains' : undefined,
      },
      {
        stageId: 'RISK_PREDICTION',
        stepNumber: 3,
        label: 'RISK PREDICTION',
        description: 'Spatial & temporal urban risk forecasting',
        status: isCompleted ? 'COMPLETED' : 'PENDING',
        detailSummary: isCompleted ? 'Predicted Flood Risk Score: 88.5 / 100 (CRITICAL)' : undefined,
      },
      {
        stageId: 'WHAT_IF_SIMULATION',
        stepNumber: 4,
        label: 'WHAT-IF SIMULATION',
        description: '6h Cascade simulation & pump mitigation modeling',
        status: isCompleted ? 'COMPLETED' : 'PENDING',
        detailSummary: isCompleted ? 'Simulated 6h horizon flood mitigation' : undefined,
      },
      {
        stageId: 'DECISION_PRIORITY',
        stepNumber: 5,
        label: 'DECISION PRIORITY',
        description: 'Pareto multi-objective optimization across risk & cost',
        status: isCompleted ? 'COMPLETED' : 'PENDING',
        detailSummary: isCompleted ? 'Pareto optimal candidate selected' : undefined,
      },
      {
        stageId: 'INTERVENTION_PLAN',
        stepNumber: 6,
        label: 'INTERVENTION PLAN',
        description: 'Multi-domain municipal intervention planning',
        status: isCompleted ? 'COMPLETED' : 'PENDING',
        detailSummary: isCompleted ? 'Benz Circle Multimodal Plan generated' : undefined,
      },
      {
        stageId: 'COMMAND_ESCALATION',
        stepNumber: 7,
        label: 'COMMAND ESCALATION',
        description: 'Governance evaluation & command escalation',
        status: isCompleted ? 'COMPLETED' : 'PENDING',
        detailSummary: isCompleted ? 'Escalated to EMERGENCY_COMMANDER level' : undefined,
      },
      {
        stageId: 'HUMAN_AUTHORIZATION',
        stepNumber: 8,
        label: 'HUMAN AUTHORIZATION',
        description: 'Operator review & explicit sign-off',
        status: isCompleted ? 'COMPLETED' : 'BLOCKED_BY_AUTHORIZATION',
        detailSummary: isCompleted ? 'APPROVED by Emergency Commander Patel' : 'Awaiting Operator Approval',
      },
      {
        stageId: 'AUDIT_COMPLETE',
        stepNumber: 9,
        label: 'AUDIT COMPLETE',
        description: 'Immutable audit hash event logging',
        status: isCompleted ? 'COMPLETED' : 'PENDING',
        detailSummary: isCompleted ? `Audit Event ${this.lastResult?.pipelineChain.stage9_auditLog.decisionId}` : undefined,
      },
    ];

    return {
      mode: 'DEMO_MODE',
      scenarioId: 'CITY_FLOOD_CASCADE_DEMO',
      scenarioTitle: 'Vijayawada Benz Circle Urban Flood Cascade Demo',
      state: this.currentState,
      executedAt: this.lastResult?.executedAt,
      dataSource: 'SIMULATION',
      safetyBanners: {
        demoMode: 'DEMO MODE',
        simulationData: 'SIMULATION DATA',
        noLiveControl: 'NO LIVE INFRASTRUCTURE CONTROL',
        humanAuthRequired: 'HUMAN AUTHORIZATION REQUIRED',
      },
      stages,
      metrics: this.lastResult?.metrics,
      result: this.lastResult,
      safetyGovernance: {
        requiresHumanApproval: true,
        advisoryOnly: true,
        autonomousExecution: false,
      },
    };
  }

  public async startDemo(scenarioId: string = 'CITY_FLOOD_CASCADE_DEMO'): Promise<DemoModeStatusDto> {
    logger.info(`[DemoModeService] Starting Demo Mode for scenario '${scenarioId}'`);

    // Safety Invariant Assertions
    earthMindSafetyGatewayService.assertAdvisoryMode({ advisoryOnly: true });
    earthMindSafetyGatewayService.assertNoAutonomousExecution({ autonomousExecution: false, autoExecute: false });

    this.currentState = 'RUNNING';
    const result = await cityCrisisDemoService.runDemoScenario();

    this.lastResult = result;
    this.currentState = 'COMPLETED';

    return this.getDemoState();
  }

  public resetDemo(): DemoModeStatusDto {
    logger.info('[DemoModeService] Resetting Demo Mode');
    this.currentState = 'IDLE';
    this.lastResult = undefined;
    return this.getDemoState();
  }

  public async replayDemo(): Promise<DemoModeStatusDto> {
    logger.info('[DemoModeService] Replaying Demo Mode scenario');
    this.resetDemo();
    return this.startDemo('CITY_FLOOD_CASCADE_DEMO');
  }

  public getAuditTrail(): any {
    if (!this.lastResult) {
      return { status: 'NO_DEMO_EXECUTED', auditRecords: [] };
    }
    return {
      status: 'AUDIT_RECORDED',
      caseId: this.lastResult.pipelineChain.stage9_auditLog.caseId,
      decisionId: this.lastResult.pipelineChain.stage9_auditLog.decisionId,
      decidedBy: this.lastResult.pipelineChain.stage9_auditLog.decidedBy,
      decidedAt: this.lastResult.pipelineChain.stage9_auditLog.decidedAt,
      decision: this.lastResult.pipelineChain.stage9_auditLog.decision,
      provenance: 'SIMULATION',
      requiresHumanApproval: true,
      autonomousExecution: false,
    };
  }
}

export const demoModeService = new DemoModeService();
