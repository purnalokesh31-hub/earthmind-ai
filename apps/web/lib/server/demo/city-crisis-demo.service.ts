// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Deterministic City Crisis Demo Scenario Service
// Scenario Identifier: DEMO_CITY_CRISIS_001
// Connects Phase 7.8 → 7.9.1 → 7.9.2 → 7.9.4 → 7.10 → 7.11
// ──────────────────────────────────────────────────────────────

import { CrossDomainSignalDto } from '../domain/digital-twin/cross-domain.domain';
import { crossDomainCorrelationService } from '../services/cross-domain-correlation.service';
import { cityRiskPredictionService } from '../services/city-risk-prediction.service';
import { cityPredictionSimulationService } from '../services/city-prediction-simulation.service';
import { cityDecisionOrchestratorService } from '../services/city-decision-orchestrator.service';
import { cityInterventionOrchestratorService } from '../services/city-intervention-orchestrator.service';
import { cityGovernanceEvaluationService } from '../services/city-governance-evaluation.service';
import { cityCommandDecisionService } from '../services/city-command-decision.service';
import { memoryCityCommandRepository } from '../repositories/city-command.repository';
import { earthMindSafetyGatewayService } from '../services/earthmind-safety-gateway.service';
import { earthMindProvenanceService } from '../services/earthmind-provenance.service';
import { logger } from '../logger';

export interface CityCrisisDemoScenarioInputDto {
  cityId?: string;
  requestedByUserId?: string;
}

export interface CityCrisisDemoMetricsDto {
  rainfallAccumulationMmHr: number;
  predictedFloodRiskScore: number;
  roadCongestionPercent: number;
  transitDelayMinutes: number;
  emergencyAccessDelayMinutes: number;
  utilityThermalRiskCelsius: number;
  populationExposureCount: number;
}

export interface CityCrisisDemoPipelineChainDto {
  stage1_signals: CrossDomainSignalDto[];
  stage2_correlation: any;
  stage3_prediction: any;
  stage4_simulation: any;
  stage5_decisionPriority: any;
  stage6_interventionPlan: any;
  stage7_commandEscalation: any;
  stage8_humanAuthorization: any;
  stage9_auditLog: any;
}

export interface CityCrisisDemoScenarioResultDto {
  demoId: 'DEMO_CITY_CRISIS_001';
  scenarioTitle: string;
  scenarioDescription: string;
  city: string;
  affectedZone: string;
  executedAt: string;
  dataSource: 'SIMULATION';
  metrics: CityCrisisDemoMetricsDto;
  pipelineChain: CityCrisisDemoPipelineChainDto;
  safetyGovernance: {
    requiresHumanApproval: true;
    advisoryOnly: true;
    autonomousExecution: false;
    provenanceVerified: boolean;
  };
}

export class CityCrisisDemoService {
  public static readonly DEMO_ID = 'DEMO_CITY_CRISIS_001';

  /**
   * Executes the deterministic end-to-end City Crisis Demonstration Scenario (DEMO_CITY_CRISIS_001)
   */
  public async runDemoScenario(
    input: CityCrisisDemoScenarioInputDto = {}
  ): Promise<CityCrisisDemoScenarioResultDto> {
    const cityId = input.cityId || 'city-vja';
    const operatorId = input.requestedByUserId || 'usr-cmd-patel';

    logger.info(`[CityCrisisDemoService] Executing deterministic demo scenario '${CityCrisisDemoService.DEMO_ID}' for city '${cityId}'`);

    // 1. Safety Gateway Assertions
    earthMindSafetyGatewayService.assertAdvisoryMode({ advisoryOnly: true });
    earthMindSafetyGatewayService.assertNoAutonomousExecution({ autonomousExecution: false, autoExecute: false });

    // 2. Stage 1: Environmental / Climate Signal & Cross-Domain Signals (Deterministic)
    const mockSignals: CrossDomainSignalDto[] = [
      {
        signalId: 'sig-clm-rain-001',
        domain: 'CLIMATE',
        entityId: 'ast-clm-benz-01',
        entityName: 'Benz Circle Drainage Catchment',
        eventType: 'HEAVY_RAINFALL',
        severity: 'CRITICAL',
        location: { lat: 16.506, lng: 80.648, zoneId: 'zone-benz-circle' },
        value: 145.0,
        unit: 'mm/hr',
        timestamp: new Date().toISOString(),
      },
      {
        signalId: 'sig-mob-nh9-001',
        domain: 'MOBILITY',
        entityId: 'ast-mob-arterial-nh9',
        entityName: 'NH-9 Main Arterial Corridor',
        eventType: 'ROAD_INUNDATION',
        severity: 'CRITICAL',
        location: { lat: 16.508, lng: 80.651, zoneId: 'zone-benz-circle' },
        value: 92.4,
        unit: '%',
        timestamp: new Date().toISOString(),
      },
      {
        signalId: 'sig-trn-sec4-001',
        domain: 'TRANSIT',
        entityId: 'ast-trn-fleet-sec4',
        entityName: 'Sector 4 Bus Corridor Fleet',
        eventType: 'FLEET_DELAY',
        severity: 'HIGH',
        location: { lat: 16.510, lng: 80.655, zoneId: 'zone-benz-circle' },
        value: 48.5,
        unit: 'mins',
        timestamp: new Date().toISOString(),
      },
      {
        signalId: 'sig-emg-hosp-001',
        domain: 'EMERGENCY_RESPONSE',
        entityId: 'ast-emg-hosp-route',
        entityName: 'General Hospital Response Route',
        eventType: 'DISPATCH_ACCESS_DELAY',
        severity: 'CRITICAL',
        location: { lat: 16.502, lng: 80.640, zoneId: 'zone-benz-circle' },
        value: 22.0,
        unit: 'mins',
        timestamp: new Date().toISOString(),
      },
    ];

    // 3. Stage 2: Cross-Domain Correlation (Phase 7.8)
    const correlations = crossDomainCorrelationService.correlateSignals(mockSignals);
    const primaryCorrelation = correlations[0] || {
      correlationId: `corr-demo-${Date.now()}`,
      sourceSignals: mockSignals,
      affectedDomains: ['CLIMATE', 'MOBILITY', 'TRANSIT', 'EMERGENCY_RESPONSE'],
      correlationType: 'CAUSAL',
      confidence: 94.5,
      severity: 'CRITICAL',
      causalChain: [
        'Heavy Rainfall (145 mm/hr) in Benz Circle Catchment',
        'Road Inundation & Closure on NH-9 Arterial (92.4% Congestion)',
        'Multimodal Bus Fleet Delays (>48 mins)',
        'Emergency Dispatch Delay to General Hospital Route (>22 mins)',
        'Thermal Risk Surge on Substation 4 (78.2°C)',
      ],
      affectedAssets: ['ast-clm-benz-01', 'ast-mob-arterial-nh9', 'ast-trn-fleet-sec4', 'ast-emg-hosp-route'],
      affectedPopulation: 34200,
      timestamp: new Date().toISOString(),
    };

    // 4. Stage 3: Predicted Flood Risk & Forecast (Phase 7.9.1)
    const predictionSummary = await cityRiskPredictionService.getPredictionSummary(cityId);

    // 5. Stage 4: What-If Cascade Simulation (Phase 7.9.2)
    const createdScenario = await cityPredictionSimulationService.createScenario({
      cityId,
      scenarioName: 'Benz Circle Extreme Rainfall Cascade Mitigation',
      horizon: '6h',
      severityLevel: 'CRITICAL',
      variables: [
        { variableId: 'var-rain-01', domain: 'CLIMATE', metricName: 'Rainfall Rate', baseValue: 50, simulatedValue: 145 },
      ],
      simulatedInterventions: [
        { interventionType: 'DYNAMIC_REROUTING', scalePercent: 85 },
        { interventionType: 'PUMP_STATION_MAX_DRAINAGE', scalePercent: 100 },
      ],
    } as any);
    const simulationResult = await cityPredictionSimulationService.runScenario(createdScenario.scenarioId);

    // 6. Stage 5: Decision Priority & Multi-Objective Optimization (Phase 7.9.4)
    const decisionResult = await cityDecisionOrchestratorService.runUnifiedPipeline(cityId, 'BALANCED');

    // 7. Stage 6: Multi-Domain Intervention Planning (Phase 7.10)
    const createdIntervention = cityInterventionOrchestratorService.createIntervention({
      cityId,
      scenarioId: simulationResult.scenarioId,
      title: 'Benz Circle Multimodal Flood & Traffic Mitigation',
      description: 'Pre-positioning mobile high-capacity pumps and rerouting public transit around Benz Circle corridor.',
      targetDomains: ['CLIMATE', 'MOBILITY', 'TRANSIT', 'EMERGENCY_RESPONSE'],
      requestedBy: operatorId,
    });
    const interventionResult = cityInterventionOrchestratorService.runInterventionAnalysis(createdIntervention.interventionId);

    // 8. Stage 7: Human Command Governance & Policy Check (Phase 7.11)
    const governanceEvaluation = cityGovernanceEvaluationService.evaluateGovernancePipeline({
      targetId: createdIntervention.interventionId,
      cityId,
      riskScore: 88.5,
      confidenceScorePercent: decisionResult.decisionConfidence,
      impactedDomains: ['CLIMATE', 'MOBILITY', 'TRANSIT', 'EMERGENCY_RESPONSE'],
      requiresHumanApproval: true,
    });

    // 9. Stage 8: Human Command Case Creation & Operator Authorization
    const commandCase = memoryCityCommandRepository.createCase({
      title: 'Benz Circle Flood & Traffic Intervention Case',
      description: 'Human Command Authorization case for Benz Circle emergency flood mitigation.',
      cityId,
      sourceType: 'INTERVENTION_PLANNING',
      sourceReferenceId: createdIntervention.interventionId,
      riskScore: 88.5,
      riskTier: 'CRITICAL',
      confidenceScore: decisionResult.decisionConfidence,
      confidenceLevel: 'HIGH_CONFIDENCE',
      populationImpact: 34200,
      serviceImpact: 2500,
      financialImpactUsd: 45000,
      requiredAuthorizationLevel: governanceEvaluation.requiredAuthorizationLevel,
      recommendation: {
        recommendationId: `rec-demo-${Date.now()}`,
        title: 'Execute Benz Circle Multimodal Mitigation Plan',
        summary: 'Deploy 4 mobile pumps & reroute Sector 4 transit around NH-9.',
        targetId: createdIntervention.interventionId,
        expectedRiskReductionDelta: 42.5,
        estimatedCostUsd: 12500,
        estimatedDurationHours: 3,
        requiresHumanApproval: true,
        provenance: 'INTERVENTION_PLANNING',
      },
    });

    const operator = {
      userId: operatorId,
      name: 'City Emergency Commander Patel',
      // 'role' must be a real RoleType (auth) value — SYSTEM_ADMIN is the highest real role and
      // maps to EMERGENCY_COMMANDER authorization tier, which this CRITICAL-risk demo case
      // requires. 'authorizationLevel' is the separate GovernanceAuthorizationLevel field.
      role: 'SYSTEM_ADMIN' as const,
      authorizationLevel: 'EMERGENCY_COMMANDER' as const,
    };

    const operatorDecisionResult = cityCommandDecisionService.processOperatorDecision(operator, {
      caseId: commandCase.caseId,
      decision: 'APPROVE',
      confirmationToken: `tok-demo-confirm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      reason: 'Approved Benz Circle flood mitigation plan based on simulated risk reduction of 42.5 points.',
    });

    // 10. Stage 9: Provenance & Audit Logging Verification
    const taggedResult = earthMindProvenanceService.verifyProvenance('DECISION_INTELLIGENCE', 94.5, commandCase.caseId);

    return {
      demoId: CityCrisisDemoService.DEMO_ID,
      scenarioTitle: 'Vijayawada Benz Circle Heavy Rainfall & Multimodal Cascade Demo',
      scenarioDescription:
        'Deterministic demonstration showing end-to-end operational intelligence from climate telemetry to human command approval and audit recording.',
      city: 'Vijayawada (city-vja)',
      affectedZone: 'Benz Circle Drainage Catchment & NH-9 Corridor (zone-benz-circle)',
      executedAt: new Date().toISOString(),
      dataSource: 'SIMULATION',
      metrics: {
        rainfallAccumulationMmHr: 145.0,
        predictedFloodRiskScore: 88.5,
        roadCongestionPercent: 92.4,
        transitDelayMinutes: 48.5,
        emergencyAccessDelayMinutes: 22.0,
        utilityThermalRiskCelsius: 78.2,
        populationExposureCount: 34200,
      },
      pipelineChain: {
        stage1_signals: mockSignals,
        stage2_correlation: primaryCorrelation,
        stage3_prediction: predictionSummary,
        stage4_simulation: simulationResult,
        stage5_decisionPriority: decisionResult,
        stage6_interventionPlan: interventionResult,
        stage7_commandEscalation: governanceEvaluation.escalationLevel,
        stage8_humanAuthorization: operatorDecisionResult.decision,
        stage9_auditLog: {
          decisionId: operatorDecisionResult.decision.decisionId,
          decidedAt: operatorDecisionResult.decision.decidedAt,
          decidedBy: operatorDecisionResult.decision.operator.userId,
          decision: operatorDecisionResult.decision.decision,
          status: operatorDecisionResult.caseEntity.status,
          caseId: operatorDecisionResult.caseEntity.caseId,
        },
      },
      safetyGovernance: {
        requiresHumanApproval: true,
        advisoryOnly: true,
        autonomousExecution: false,
        provenanceVerified: taggedResult.confidence > 0,
      },
    };
  }
}

export const cityCrisisDemoService = new CityCrisisDemoService();
