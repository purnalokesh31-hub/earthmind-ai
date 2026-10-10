// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.9.4 Mitigation Candidate Generation Service
// ──────────────────────────────────────────────────────────────

import { MitigationCandidateDto, MitigationActionDto } from '../domain/digital-twin/city-decision-intelligence.domain';
import { logger } from '../logger';

export class CityMitigationCandidateService {
  generateCandidates(scenarioId: string, cityId: string): MitigationCandidateDto[] {
    const candidates: MitigationCandidateDto[] = [
      {
        candidateId: 'cand-a-rapid-emergency',
        name: 'Rapid Emergency & Flood Barrier Deployment',
        description: 'Deploys mobile flood barriers along storm channels and dispatches high-water rescue vehicles',
        category: 'CANDIDATE_A',
        actions: [
          { actionId: 'act-a1', domain: 'CLIMATE', title: 'Barrier Deployment', targetAsset: 'Channel Zone 4', actionType: 'DEPLOYMENT', estimatedDurationHours: 1.5, estimatedCostUsd: 45000 },
          { actionId: 'act-a2', domain: 'EMERGENCY_RESPONSE', title: 'Rescue Staging', targetAsset: 'Sector B Station', actionType: 'STAGING', estimatedDurationHours: 1.0, estimatedCostUsd: 25000 },
        ],
        estimatedCost: 70000,
        estimatedDowntime: 1.5,
        populationImpact: 16500,
        riskReduction: 26.5,
        resourceRequirements: { emergencyCrews: 8, roadBarriers: 25, emergencyVehicles: 4 },
        executionComplexity: 'LOW',
        confidence: 93.5,
        feasible: true,
        score: 0,
        rank: 0,
        dataSource: 'SIMULATION',
        requiresHumanApproval: true,
      },
      {
        candidateId: 'cand-b-resource-redistribution',
        name: 'Cross-District Resource Redistribution',
        description: 'Reallocates auxiliary pumping units and backup generators from East Ward to vulnerable North Substation',
        category: 'CANDIDATE_B',
        actions: [
          { actionId: 'act-b1', domain: 'UTILITY', title: 'Generator Transfer', targetAsset: 'Substation TX-4', actionType: 'TRANSFER', estimatedDurationHours: 2.0, estimatedCostUsd: 35000 },
        ],
        estimatedCost: 35000,
        estimatedDowntime: 2.0,
        populationImpact: 12000,
        riskReduction: 19.0,
        resourceRequirements: { engineeringCrews: 4, mobileGenerators: 3 },
        executionComplexity: 'MEDIUM',
        confidence: 91.0,
        feasible: true,
        score: 0,
        rank: 0,
        dataSource: 'SIMULATION',
        requiresHumanApproval: true,
      },
      {
        candidateId: 'cand-c-mobility-rerouting',
        name: 'Adaptive Mobility Rerouting & Corridor Protection',
        description: 'Automates signal timing adjustment and opens BRT express corridors for emergency transit',
        category: 'CANDIDATE_C',
        actions: [
          { actionId: 'act-c1', domain: 'MOBILITY', title: 'Signal Optimization', targetAsset: 'Arterial Corridor 9', actionType: 'SIGNAL_ADJUSTMENT', estimatedDurationHours: 0.5, estimatedCostUsd: 15000 },
        ],
        estimatedCost: 15000,
        estimatedDowntime: 0.5,
        populationImpact: 22000,
        riskReduction: 21.5,
        resourceRequirements: { trafficPersonnel: 6, roadBarriers: 15 },
        executionComplexity: 'LOW',
        confidence: 96.0,
        feasible: true,
        score: 0,
        rank: 0,
        dataSource: 'SIMULATION',
        requiresHumanApproval: true,
      },
      {
        candidateId: 'cand-g-balanced-multi-domain',
        name: 'Integrated Multi-Domain Shield (Balanced Strategy)',
        description: 'Combined strategy featuring pump activation, transformer micro-grid islanding, and traffic rerouting',
        category: 'CANDIDATE_G',
        actions: [
          { actionId: 'act-g1', domain: 'CLIMATE', title: 'Pumping Activation', targetAsset: 'Station P-12', actionType: 'PUMPING', estimatedDurationHours: 2.5, estimatedCostUsd: 85000 },
          { actionId: 'act-g2', domain: 'UTILITY', title: 'Grid Islanding', targetAsset: 'Substation TX-4', actionType: 'ISLANDING', estimatedDurationHours: 1.5, estimatedCostUsd: 60000 },
          { actionId: 'act-g3', domain: 'MOBILITY', title: 'Traffic Rerouting', targetAsset: 'Highway 16', actionType: 'REROUTING', estimatedDurationHours: 1.0, estimatedCostUsd: 20000 },
        ],
        estimatedCost: 165000,
        estimatedDowntime: 2.5,
        populationImpact: 34200,
        riskReduction: 38.5,
        resourceRequirements: { emergencyCrews: 10, engineeringCrews: 6, utilityTechnicians: 4, trafficPersonnel: 8 },
        executionComplexity: 'HIGH',
        confidence: 92.5,
        feasible: true,
        score: 0,
        rank: 0,
        dataSource: 'SIMULATION',
        requiresHumanApproval: true,
      },
    ];

    logger.info(`[CityMitigationCandidateService] Generated ${candidates.length} mitigation candidate strategies for scenario '${scenarioId}'`);
    return candidates;
  }
}

export const cityMitigationCandidateService = new CityMitigationCandidateService();
