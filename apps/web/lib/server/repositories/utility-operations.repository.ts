// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.7.5 Utility Operations Repository
// ──────────────────────────────────────────────────────────────

import { UtilityOperationsCycleEntity } from '../domain/digital-twin/utility-operations.domain';

export interface IUtilityOperationsRepository {
  listCyclesByCityId(cityId: string): Promise<UtilityOperationsCycleEntity[]>;
  findCycleById(cycleId: string): Promise<UtilityOperationsCycleEntity | null>;
  saveCycle(cycle: UtilityOperationsCycleEntity): Promise<UtilityOperationsCycleEntity>;
}

export class MemoryUtilityOperationsRepository implements IUtilityOperationsRepository {
  private cycles: UtilityOperationsCycleEntity[] = [
    {
      cycleId: 'cyc-utl-301',
      input: {
        title: 'Ward 12 Substation Continuous Operational Closed-Loop Intelligence',
        cityId: 'city-vja',
        utilityType: 'ELECTRICITY',
        primaryTargetAssetId: 'ast-pow-tx-102',
      },
      status: 'AWAITING_HUMAN_APPROVAL',
      signals: [
        {
          signalId: 'sig-301',
          assetId: 'ast-pow-tx-102',
          assetName: 'Ward 12 Primary Transformer TX-4',
          anomalyType: 'THERMAL',
          severity: 'HIGH',
          observedValue: 92.4,
          thresholdValue: 85.0,
          unit: 'Celsius',
          timestamp: new Date().toISOString(),
          confidenceScore: 94.5,
        },
      ],
      decision: {
        decisionId: 'dec-301',
        priority: 'HIGH',
        recommendedAction: 'Execute 30% Load Transfer to TX-5 Reserve + Forced Radiator Cooling Override',
        confidence: 92.5,
        expectedBenefit: 'Prevents transformer thermal runaway failure and restores 100% service in 1.5 hrs.',
        expectedRisk: 'Low transient switching fluctuation.',
        expectedCostUsd: 3200,
        expectedDowntimeHours: 1.5,
        affectedPopulation: 0,
      },
      recommendation: {
        recommendationId: 'rec-ops-301',
        decision: {
          decisionId: 'dec-301',
          priority: 'HIGH',
          recommendedAction: 'Execute 30% Load Transfer to TX-5 Reserve + Forced Radiator Cooling Override',
          confidence: 92.5,
          expectedBenefit: 'Prevents transformer thermal runaway failure and restores 100% service in 1.5 hrs.',
          expectedRisk: 'Low transient switching fluctuation.',
          expectedCostUsd: 3200,
          expectedDowntimeHours: 1.5,
          affectedPopulation: 0,
        },
        summary: 'Authorize 30% Load Transfer to TX-5 Reserve & Forced Fan Cooling Override',
        rationale: 'Fuses thermal anomaly signal (92.4 C) with Phase 7.7.2 failure probability (78.5%) and Phase 7.7.4 optimal recovery candidate.',
        requiresHumanApproval: true,
        approvalStatus: 'PENDING',
      },
      timeline: [
        {
          eventId: 'evt-301',
          eventType: 'TELEMETRY_RECEIVED',
          description: 'Received telemetry update for asset ast-pow-tx-102',
          actor: 'TelemetryIngestionService',
          timestamp: new Date().toISOString(),
        },
        {
          eventId: 'evt-302',
          eventType: 'ANOMALY_DETECTED',
          description: 'Thermal anomaly correlated: 92.4 C (HIGH)',
          actor: 'UtilityAnomalyCorrelationService',
          timestamp: new Date().toISOString(),
        },
        {
          eventId: 'evt-303',
          eventType: 'RECOMMENDATION_GENERATED',
          description: 'Advisory recommendation rec-ops-301 ready for human authorization',
          actor: 'UtilityOperationsOrchestratorService',
          timestamp: new Date().toISOString(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  async listCyclesByCityId(cityId: string): Promise<UtilityOperationsCycleEntity[]> {
    return this.cycles.filter((c) => c.input.cityId === cityId);
  }

  async findCycleById(cycleId: string): Promise<UtilityOperationsCycleEntity | null> {
    return this.cycles.find((c) => c.cycleId === cycleId) || null;
  }

  async saveCycle(cycle: UtilityOperationsCycleEntity): Promise<UtilityOperationsCycleEntity> {
    const idx = this.cycles.findIndex((c) => c.cycleId === cycle.cycleId);
    if (idx >= 0) this.cycles[idx] = cycle;
    else this.cycles.push(cycle);
    return cycle;
  }
}

export const memoryUtilityOperationsRepository = new MemoryUtilityOperationsRepository();
