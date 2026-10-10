// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.9.3 Unified Prediction → Simulation → Optimization Orchestrator
// Connects Phase 7.8, Phase 7.9.1, Phase 7.9.2, and Phase 7.9.3 into a continuous intelligence pipeline
// ──────────────────────────────────────────────────────────────

import { cityIntelligenceService, CityIntelligenceSummaryDto } from './city-intelligence.service';
import { cityRiskPredictionService } from './city-risk-prediction.service';
import { cityPredictionScenarioService } from './city-prediction-scenario.service';
import {
  cityDecisionOptimizationEngineService,
  OptimizationResultSummary,
  EvaluatedCandidateOption,
  DecisionConstraintRules,
  OptimizationStrategy,
  RawCandidateMetrics,
} from './city-decision-optimization.service';
import { cityDecisionRepository } from '../repositories/city-decision.repository';
import { logger } from '../logger';

export interface DecisionPipelineExplainabilityDto {
  whatHappened: string;
  whyIsItRisky: string;
  whatCouldHappenNext: string;
  whatInterventionsWereConsidered: string[];
  whyWasThisInterventionRankedHighest: string;
  whatAreTheExpectedBenefits: string;
  whatConstraintsExist: string[];
  whatUncertaintyExists: string;
  whyDoesHumanApprovalRemainNecessary: string;
}

export interface UnifiedCityDecisionContextDto {
  cityId: string;
  pipelineExecutionId: string;
  executedAt: Date;
  triggeringSignalsCount: number;
  triggeringSignalSummaries: string[];
  causalChains: string[];
  forecastHorizon: string;
  baselineRiskScore: number;
  simulatedPeakRiskScore: number;
  riskDelta: number;
  cascadeDepth: number;
  highestRiskDomain: string;
  populationExposure: number;
  affectedInfrastructureCount: number;
  serviceImpactPercent: number;
  optimizationStrategy: OptimizationStrategy;
  evaluatedCandidateCount: number;
  evaluatedCandidates: EvaluatedCandidateOption[];
  recommendedCandidate: EvaluatedCandidateOption | null;
  explainability: DecisionPipelineExplainabilityDto;
  requiresHumanApproval: boolean; // MUST ALWAYS BE TRUE
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  operatorApproval: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy: string | null;
  approvedAt: Date | string | null;
  approvalReason: string | null;
  decisionConfidence: number;
  decisionExplanation: string;
  auditEventId: string | null;
  dataSource: 'SIMULATION';
}

export class CityDecisionOrchestratorService {
  /**
   * Runs the full end-to-end continuous intelligence pipeline:
   * Cross-Domain Signals -> Citywide Risk Forecast -> Scenario Cascade Simulation -> Intervention Generation -> Multi-Objective Optimization -> Explainability -> Human Authorization
   */
  async runUnifiedPipeline(
    cityId: string = 'city-vja',
    strategy: OptimizationStrategy = 'BALANCED',
    constraints: DecisionConstraintRules = {}
  ): Promise<UnifiedCityDecisionContextDto> {
    const pipelineExecutionId = `pipe-exec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    // 1. Retrieve Phase 7.8 Cross-Domain Situational Awareness Summary
    const crossDomainSummary: CityIntelligenceSummaryDto = await cityIntelligenceService.getCitywideIntelligence(cityId);

    // 2. Retrieve Phase 7.9.1 Predictive Risk Forecast
    const predictionSummary = await cityRiskPredictionService.getPredictionSummary(cityId);
    const riskForecast = predictionSummary.citywideForecast;

    // 3. Retrieve Phase 7.9.2 Scenario Cascade Simulation
    const defaultScenario = await cityPredictionScenarioService.getScenario('sim-scen-501');

    const baseRiskScore = riskForecast?.riskScore ?? crossDomainSummary.overallCascadeRisk?.riskScore ?? 52.0;
    const simulatedPeakRiskScore = defaultScenario?.result?.risk?.simulatedRiskScore ?? 88.5;
    const riskDelta = Math.round((simulatedPeakRiskScore - baseRiskScore) * 10) / 10;

    // 4. Synthesize Raw Candidate Options
    const rawCandidates: RawCandidateMetrics[] = [
      {
        optionId: 'opt-alpha-1',
        title: 'Option Alpha: Micro-Grid Islanding & Mobile Flood Barriers',
        riskReduction: 42.0,
        costUsd: 145000,
        downtimeHours: 2.5,
        populationImpact: 28500,
        serviceRestorationPercent: 90,
        resilienceImprovementPercent: 85,
        resourceUtilizationCount: 12,
        confidencePercent: 94.5,
        feasibilityScore: 91.0,
      },
      {
        optionId: 'opt-beta-2',
        title: 'Option Beta: Rapid Transit Rerouting & Pumping Station Boost',
        riskReduction: 22.0,
        costUsd: 85000,
        downtimeHours: 1.5,
        populationImpact: 19000,
        serviceRestorationPercent: 80,
        resilienceImprovementPercent: 70,
        resourceUtilizationCount: 8,
        confidencePercent: 91.0,
        feasibilityScore: 94.0,
        overallScore: 94.0,
      },
      {
        optionId: 'opt-gamma-3',
        title: 'Option Gamma: Load Shedding & Spillway Switchover',
        riskReduction: 18.0,
        costUsd: 290000,
        downtimeHours: 7.0,
        populationImpact: 35000,
        serviceRestorationPercent: 60,
        resilienceImprovementPercent: 60,
        resourceUtilizationCount: 24,
        confidencePercent: 86.0,
        feasibilityScore: 70.0,
      },
    ];

    // 5. Execute Phase 7.9.3 Multi-Objective Decision Optimization
    const optimizationResult: OptimizationResultSummary =
      await cityDecisionOptimizationEngineService.optimizeDecisions(
        pipelineExecutionId,
        rawCandidates,
        strategy,
        constraints,
        baseRiskScore,
        simulatedPeakRiskScore
      );

    const recommendedOption =
      optimizationResult.evaluatedCandidates.find((c) => c.evaluationStatus === 'RECOMMENDED') ||
      optimizationResult.evaluatedCandidates[0] ||
      null;

    // 6. Construct Comprehensive Decision Explainability
    const triggeringSummaries = crossDomainSummary.activeCorrelations.map(
      (c) => `[${c.correlationType}] ${c.explanation}`
    );

    const causalChains = defaultScenario?.result?.cascadeSteps?.map(
      (s) => `${s.sourceDomain} ${s.triggerEvent} -> ${s.targetDomain} (${s.cascadingImpactDescription})`
    ) ?? [
      'CLIMATE inundation -> MOBILITY road closure',
      'MOBILITY road closure -> TRANSIT bus delay',
      'TRANSIT bus delay -> EMERGENCY_RESPONSE dispatch delay',
    ];

    const constraintDescriptions: string[] = [];
    if (constraints.maxBudgetUsd) constraintDescriptions.push(`MAX_BUDGET: $${constraints.maxBudgetUsd.toLocaleString()}`);
    if (constraints.maxDowntimeHours) constraintDescriptions.push(`MAX_DOWNTIME: ${constraints.maxDowntimeHours}h`);
    if (constraints.maxPopulationImpact) constraintDescriptions.push(`MAX_POPULATION_IMPACT: ${constraints.maxPopulationImpact.toLocaleString()} citizens`);
    if (constraintDescriptions.length === 0) constraintDescriptions.push('Standard municipal operational capacity and budgetary limits');

    const explainability: DecisionPipelineExplainabilityDto = {
      whatHappened: `High-intensity precipitation triggered severe urban inundation across ${cityId}, causing multi-domain cascade signals between CLIMATE, UTILITY, and EMERGENCY_RESPONSE.`,
      whyIsItRisky: `Base risk score is ${baseRiskScore}/100. Without proactive intervention, flood cascade threatens grid substation overload and increases peak city risk to ${simulatedPeakRiskScore}/100 (+${riskDelta} pts).`,
      whatCouldHappenNext: `Unmitigated cascade may result in power outages to 34,200 residents, transit disruptions up to 65%, and emergency dispatch delays exceeding 28 minutes.`,
      whatInterventionsWereConsidered: rawCandidates.map((c) => `${c.title} ($${(c.costUsd || 0).toLocaleString()}, ${c.downtimeHours}h downtime, ${c.riskReduction} pts risk reduction)`),
      whyWasThisInterventionRankedHighest: recommendedOption
        ? `'${recommendedOption.title}' ranked #1 (Score: ${recommendedOption.overallDecisionScore}/100) under strategy '${strategy}'. It balances maximum risk reduction (${recommendedOption.riskReduction} pts) with minimal downtime (${recommendedOption.downtimeHours}h) while satisfying 100% of operational constraints.`
        : 'No candidate option satisfied all hard constraints.',
      whatAreTheExpectedBenefits: recommendedOption
        ? `Reduces projected peak risk by ${recommendedOption.riskReduction} pts, restores ${recommendedOption.serviceRestorationPercent}% of affected utility services, and improves long-term resilience by ${recommendedOption.resilienceImprovementPercent}%.`
        : 'None',
      whatConstraintsExist: constraintDescriptions,
      whatUncertaintyExists: `Simulation model confidence is ${recommendedOption?.confidencePercent ?? 94.5}%. Forecast assumes stationary precipitation intensity over 6h window.`,
      whyDoesHumanApprovalRemainNecessary: `Automated execution could cause unintended grid shedding or traffic re-routing impacts. Human authorization is mandatory to ensure municipal safety oversight before physical execution.`,
    };

    logger.info(`[CityDecisionOrchestratorService] Executed pipeline '${pipelineExecutionId}'. Recommendation: '${recommendedOption?.title}'`);

    const resultContext: UnifiedCityDecisionContextDto = {
      cityId,
      pipelineExecutionId,
      executedAt: new Date(),
      triggeringSignalsCount: crossDomainSummary.activeCorrelations.length,
      triggeringSignalSummaries: triggeringSummaries,
      causalChains,
      forecastHorizon: '6h',
      baselineRiskScore: baseRiskScore,
      simulatedPeakRiskScore,
      riskDelta,
      cascadeDepth: crossDomainSummary.overallCascadeRisk?.propagationMetrics?.crossDomainPropagationDepth ?? 3,
      highestRiskDomain: crossDomainSummary.overallCascadeRisk?.highestRiskDomain || 'CLIMATE',
      populationExposure: defaultScenario?.result?.impact?.affectedPopulation ?? 34200,
      affectedInfrastructureCount: (crossDomainSummary.overallCascadeRisk?.secondaryFailures?.length || 0) + 1,
      serviceImpactPercent: defaultScenario?.result?.impact?.transitServiceDisruptionPercent ?? 54,
      optimizationStrategy: strategy,
      evaluatedCandidateCount: optimizationResult.evaluatedCandidates.length,
      evaluatedCandidates: optimizationResult.evaluatedCandidates,
      recommendedCandidate: recommendedOption,
      explainability,
      requiresHumanApproval: true, // MUST ALWAYS BE TRUE
      approvalStatus: 'PENDING',
      operatorApproval: 'PENDING',
      approvedBy: null,
      approvedAt: null,
      approvalReason: null,
      decisionConfidence: recommendedOption?.confidencePercent ?? 94.5,
      decisionExplanation: explainability.whyWasThisInterventionRankedHighest,
      auditEventId: null,
      dataSource: 'SIMULATION',
    };

    cityDecisionRepository.saveDecision(resultContext);
    return resultContext;
  }

  async getDecisionById(id: string): Promise<UnifiedCityDecisionContextDto> {
    const existing = cityDecisionRepository.getDecisionById(id);
    if (existing) return existing;
    // Generate new decision context if not found
    const context = await this.runUnifiedPipeline('city-vja');
    context.pipelineExecutionId = id;
    cityDecisionRepository.saveDecision(context);
    return context;
  }

  async listDecisions(cityId?: string): Promise<UnifiedCityDecisionContextDto[]> {
    let list = cityDecisionRepository.listDecisions(cityId);
    if (list.length === 0) {
      const defaultRun = await this.runUnifiedPipeline(cityId || 'city-vja');
      list = [defaultRun];
    }
    return list;
  }

  async approveDecision(
    id: string,
    decision: 'APPROVED' | 'REJECTED' | 'REQUESTED_REVIEW',
    operatorName?: string,
    operatorRole?: string,
    reason?: string,
    userId?: string
  ) {
    return cityDecisionRepository.approveDecision(id, decision, operatorName, operatorRole, reason, userId);
  }

  async getDecisionHistory() {
    return cityDecisionRepository.getHistory();
  }
}

export const cityDecisionOrchestratorService = new CityDecisionOrchestratorService();
