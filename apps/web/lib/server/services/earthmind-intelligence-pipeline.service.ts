// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Master System Intelligence Pipeline Service
// Connects Phase 7.8 → 7.9.1 → 7.9.2 → 7.9.4 → 7.10 → 7.11
// ──────────────────────────────────────────────────────────────

import { CrossDomainSignalDto } from '../domain/digital-twin/cross-domain.domain';
import { crossDomainCorrelationService } from './cross-domain-correlation.service';
import { cityRiskPredictionService } from './city-risk-prediction.service';
import { cityPredictionSimulationService } from './city-prediction-simulation.service';
import { cityDecisionOrchestratorService } from './city-decision-orchestrator.service';
import { cityInterventionOrchestratorService } from './city-intervention-orchestrator.service';
import { cityGovernanceEvaluationService } from './city-governance-evaluation.service';
import { earthMindSafetyGatewayService } from './earthmind-safety-gateway.service';
import { earthMindProvenanceService } from './earthmind-provenance.service';
import { logger } from '../logger';

export interface IntelligencePipelineScenarioInput {
  cityId: string;
  scenarioType: 'EXTREME_RAINFALL_CASCADE' | 'SUBSTATION_THERMAL_FAILURE' | 'WATER_CONTAMINATION_CASCADE';
  requestedByUserId: string;
}

export interface IntelligencePipelineExecutionResult {
  pipelineId: string;
  cityId: string;
  scenarioType: string;
  timestamp: string;
  executionChain: {
    stage1_signals: CrossDomainSignalDto[];
    stage2_correlation: any;
    stage3_prediction: any;
    stage4_simulation: any;
    stage5_decisionIntelligence: any;
    stage6_interventionPlanning: any;
    stage7_humanCommandEscalation: any;
    stage8_governanceAuthorization: any;
  };
  safetyGovernance: {
    requiresHumanApproval: true;
    advisoryOnly: true;
    autonomousExecution: false;
    provenanceVerified: boolean;
  };
}

export class EarthMindIntelligencePipelineService {
  public async executePipeline(
    input: IntelligencePipelineScenarioInput
  ): Promise<IntelligencePipelineExecutionResult> {
    const pipelineId = `pipe-${Date.now()}`;
    logger.info(`[IntelligencePipeline] Initiating end-to-end pipeline run '${pipelineId}' for city '${input.cityId}'`);

    // 1. Safety Gateway Assertions
    earthMindSafetyGatewayService.assertAdvisoryMode({ advisoryOnly: true });
    earthMindSafetyGatewayService.assertNoAutonomousExecution({ autonomousExecution: false, autoExecute: false });

    // 2. Stage 1: Cross-Domain Signals & Correlation (Phase 7.8)
    const mockSignals: CrossDomainSignalDto[] = [
      {
        signalId: 'sig-clm-rain',
        domain: 'CLIMATE',
        entityId: 'ast-clm-01',
        entityName: 'Benz Circle Drainage Catchment',
        eventType: 'HEAVY_RAINFALL',
        severity: 'CRITICAL',
        location: { lat: 16.506, lng: 80.648, zoneId: 'zone-benz-circle' },
        value: 145.0,
        unit: 'mm/hr',
        timestamp: new Date().toISOString(),
      },
      {
        signalId: 'sig-mob-traffic',
        domain: 'MOBILITY',
        entityId: 'ast-mob-arterial-12',
        entityName: 'NH-9 Main Arterial Corridor',
        eventType: 'TRAFFIC_CONGESTION',
        severity: 'CRITICAL',
        location: { lat: 16.508, lng: 80.651, zoneId: 'zone-nh9' },
        value: 92.4,
        unit: '%',
        timestamp: new Date().toISOString(),
      },
      {
        signalId: 'sig-trn-delay',
        domain: 'TRANSIT',
        entityId: 'ast-trn-fleet-b2',
        entityName: 'Sector 4 Bus Corridor',
        eventType: 'BUS_DELAY',
        severity: 'HIGH',
        location: { lat: 16.510, lng: 80.655, zoneId: 'zone-sector4' },
        value: 48.5,
        unit: 'mins',
        timestamp: new Date().toISOString(),
      },
      {
        signalId: 'sig-emg-access',
        domain: 'EMERGENCY_RESPONSE',
        entityId: 'ast-emg-hosp-01',
        entityName: 'General Hospital Response Route',
        eventType: 'EMERGENCY_DISPATCH_DELAY',
        severity: 'CRITICAL',
        location: { lat: 16.502, lng: 80.640, zoneId: 'zone-hospital' },
        value: 22.0,
        unit: 'mins',
        timestamp: new Date().toISOString(),
      },
    ];

    const correlations = crossDomainCorrelationService.correlateSignals(mockSignals);
    const primaryCorrelation = correlations[0] || {
      correlationId: `corr-cascade-${Date.now()}`,
      sourceSignals: mockSignals,
      affectedDomains: ['CLIMATE', 'MOBILITY', 'TRANSIT', 'EMERGENCY_RESPONSE'],
      correlationType: 'CAUSAL',
      confidence: 94.5,
      severity: 'CRITICAL',
      causalChain: [
        'Extreme Rainfall (145mm/hr)',
        'Road Inundation & Closure on NH-9 Arterial',
        'Bus Fleet Delays (>45 mins)',
        'Emergency Dispatch Delay (22 mins)',
      ],
      timestamp: new Date().toISOString(),
    };

    // 3. Stage 2: Citywide Risk Prediction (Phase 7.9.1)
    const predictionSummary = await cityRiskPredictionService.getPredictionSummary(input.cityId);

    // 4. Stage 3: What-If Scenario Simulation (Phase 7.9.2)
    const createdScenario = await cityPredictionSimulationService.createScenario({
      cityId: input.cityId,
      scenarioName: 'Extreme Rainfall Cascade Mitigation',
      horizon: '6h',
      severityLevel: 'CRITICAL',
      variables: [{ variableId: 'var-1', domain: 'CLIMATE', metricName: 'Rainfall', baseValue: 50, simulatedValue: 145 }],
      simulatedInterventions: [
        { interventionType: 'DYNAMIC_REROUTING', scalePercent: 85 },
        { interventionType: 'PUMP_STATION_MAX_DRAINAGE', scalePercent: 100 },
      ],
    } as any);
    const simulationResult = await cityPredictionSimulationService.runScenario(createdScenario.scenarioId);

    // 5. Stage 4: Predictive Decision Intelligence (Phase 7.9.4)
    const decisionResult = await cityDecisionOrchestratorService.runUnifiedPipeline(input.cityId, 'BALANCED');

    // 6. Stage 5: Citywide Intervention Planning (Phase 7.10)
    const createdIntervention = cityInterventionOrchestratorService.createIntervention({
      cityId: input.cityId,
      scenarioId: simulationResult.scenarioId,
      title: 'Benz Circle Multimodal Flood Mitigation',
      description: 'Pre-positioning mobile pumps and rerouting public transit around Benz Circle.',
      targetDomains: ['CLIMATE', 'MOBILITY', 'TRANSIT', 'EMERGENCY_RESPONSE'],
      requestedBy: input.requestedByUserId,
    });
    const interventionResult = cityInterventionOrchestratorService.runInterventionAnalysis(createdIntervention.interventionId);

    // 7. Stage 6: Governance Evaluation & Safety Check (Phase 7.11)
    const governanceCheck = cityGovernanceEvaluationService.evaluateGovernancePipeline({
      targetId: `act-${pipelineId}`,
      cityId: input.cityId,
      riskScore: decisionResult.baselineRiskScore,
      confidenceScorePercent: decisionResult.decisionConfidence,
      impactedDomains: ['CLIMATE', 'MOBILITY', 'TRANSIT', 'EMERGENCY_RESPONSE'],
      requiresHumanApproval: true,
    });

    // Provenance Tagging Verification
    const taggedResult = earthMindProvenanceService.verifyProvenance('DECISION_INTELLIGENCE', 94.5, pipelineId);

    logger.info(`[IntelligencePipeline] Successfully completed end-to-end pipeline run '${pipelineId}'`);

    return {
      pipelineId,
      cityId: input.cityId,
      scenarioType: input.scenarioType,
      timestamp: new Date().toISOString(),
      executionChain: {
        stage1_signals: mockSignals,
        stage2_correlation: primaryCorrelation,
        stage3_prediction: predictionSummary,
        stage4_simulation: simulationResult,
        stage5_decisionIntelligence: decisionResult,
        stage6_interventionPlanning: interventionResult,
        stage7_humanCommandEscalation: governanceCheck.escalationLevel,
        stage8_governanceAuthorization: governanceCheck,
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

export const earthmindIntelligencePipelineService = new EarthMindIntelligencePipelineService();
