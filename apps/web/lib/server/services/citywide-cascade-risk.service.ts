// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.8 Citywide Cascade Risk Service
// ──────────────────────────────────────────────────────────────

import {
  CrossDomainCorrelationDto,
  CitywideCascadeRiskDto,
  CascadeRiskClassification,
} from '../domain/digital-twin/cross-domain.domain';

export class CitywideCascadeRiskService {
  calculateCascadeRisk(correlations: CrossDomainCorrelationDto[]): CitywideCascadeRiskDto {
    if (!correlations || correlations.length === 0) {
      return {
        riskScore: 10,
        classification: 'LOW',
        primaryFailure: {
          domain: 'UTILITY',
          assetId: 'none',
          assetName: 'Normal Infrastructure Grid Operations',
          description: 'No active cross-domain failure cascades detected.',
        },
        secondaryFailures: [],
        criticalDependency: 'Standard Grid Feeder Inter-tie',
        highestRiskDomain: 'UTILITY',
        highestRiskAsset: 'Normal Operations',
        affectedPopulation: 0,
        expectedServiceDisruption: 'None',
        propagationMetrics: {
          directImpactScore: 5,
          secondaryImpactScore: 0,
          tertiaryImpactScore: 0,
          crossDomainPropagationDepth: 0,
          responseDifficultyScore: 5,
          recoveryComplexityScore: 5,
          timeSensitivityScore: 5,
        },
      };
    }

    const topCorr = correlations[0];
    let rawScore = 35; // Default guarded base

    if (topCorr.affectedDomains.length >= 3) rawScore += 45;
    else if (topCorr.affectedDomains.length === 2) rawScore += 25;

    if (topCorr.severity === 'CRITICAL') rawScore += 15;
    else if (topCorr.severity === 'HIGH') rawScore += 10;

    const riskScore = Math.min(100, Math.max(0, rawScore));

    let classification: CascadeRiskClassification = 'LOW';
    if (riskScore >= 80) classification = 'CRITICAL';
    else if (riskScore >= 60) classification = 'HIGH';
    else if (riskScore >= 40) classification = 'ELEVATED';
    else if (riskScore >= 20) classification = 'GUARDED';

    return {
      riskScore,
      classification,
      primaryFailure: {
        domain: topCorr.affectedDomains[0] || 'CLIMATE',
        assetId: topCorr.affectedAssets[0] || 'ast-primary-101',
        assetName: topCorr.sourceSignals[0]?.entityName || 'Primary Urban Infrastructure Corridors',
        description: topCorr.causalChain[0] || 'Primary failure event in urban sector.',
      },
      secondaryFailures: topCorr.affectedDomains.slice(1).map((domain, i) => ({
        domain,
        assetId: topCorr.affectedAssets[i + 1] || `ast-sec-${i}`,
        description: topCorr.causalChain[i + 1] || `Cascading impact in ${domain} sector`,
      })),
      criticalDependency: topCorr.causalChain[topCorr.causalChain.length - 1] || 'Primary Emergency Dispatch Access',
      highestRiskDomain: topCorr.affectedDomains[0] || 'CLIMATE',
      highestRiskAsset: topCorr.affectedAssets[0] || 'ast-primary-101',
      affectedPopulation: topCorr.affectedPopulation || 28500,
      expectedServiceDisruption: topCorr.explanation,
      propagationMetrics: {
        directImpactScore: 85,
        secondaryImpactScore: 72,
        tertiaryImpactScore: 58,
        crossDomainPropagationDepth: topCorr.affectedDomains.length,
        responseDifficultyScore: 80,
        recoveryComplexityScore: 75,
        timeSensitivityScore: 90,
      },
    };
  }
}

export const citywideCascadeRiskService = new CitywideCascadeRiskService();
