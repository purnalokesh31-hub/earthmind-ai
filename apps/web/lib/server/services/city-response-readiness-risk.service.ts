// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.11 (Mega Prompt 3/6)
// Readiness Risk Analysis Service
// ──────────────────────────────────────────────────────────────

import {
  CityResponseReadinessRiskDto,
  ReadinessRiskLevel,
} from '../domain/digital-twin/city-response-readiness.domain';
import { memoryCityResponseReadinessRepository } from '../repositories/city-response-readiness.repository';
import { logger } from '../logger';

export class CityResponseReadinessRiskService {
  private repo = memoryCityResponseReadinessRepository;

  public evaluateReadinessRisk(readinessId: string): CityResponseReadinessRiskDto {
    const entity = this.repo.getReadiness(readinessId);
    if (!entity) {
      throw new Error(`Response readiness assessment '${readinessId}' not found.`);
    }

    const contributingFactors: Array<{ factor: string; impactScore: number; description: string }> = [];

    let riskScore = 15; // Base low risk

    // 1. Dependency Risk Factor
    const unfulfilledDeps = entity.actions.flatMap((a) => a.dependencies).filter((d) => d.status !== 'SATISFIED');
    if (unfulfilledDeps.length > 0) {
      const depScore = unfulfilledDeps.length * 15;
      riskScore += depScore;
      contributingFactors.push({
        factor: 'UNFULFILLED_DEPENDENCIES',
        impactScore: depScore,
        description: `${unfulfilledDeps.length} blocking dependencies remain unfulfilled.`,
      });
    }

    // 2. Resource Uncertainty Risk Factor
    const unknownRes = entity.actions.flatMap((a) => a.resources).filter((r) => r.availabilityStatus === 'UNKNOWN');
    if (unknownRes.length > 0) {
      const resScore = unknownRes.length * 20;
      riskScore += resScore;
      contributingFactors.push({
        factor: 'RESOURCE_UNCERTAINTY',
        impactScore: resScore,
        description: `${unknownRes.length} required resources have UNKNOWN availability status.`,
      });
    }

    // 3. Crew Standby / Uncertainty Risk Factor
    const unavailCrews = entity.actions.flatMap((a) => a.crews).filter((c) => c.readinessStatus !== 'STANDBY');
    if (unavailCrews.length > 0) {
      const crewScore = unavailCrews.length * 15;
      riskScore += crewScore;
      contributingFactors.push({
        factor: 'CREW_STANDBY_UNCERTAINTY',
        impactScore: crewScore,
        description: `${unavailCrews.length} field response crews are not on STANDBY.`,
      });
    }

    // 4. Human Approval Status Factor
    if (entity.status !== 'APPROVED' && entity.status !== 'HANDOFF_READY') {
      riskScore += 25;
      contributingFactors.push({
        factor: 'PENDING_HUMAN_AUTHORIZATION',
        impactScore: 25,
        description: 'Assessment has not received mandatory human operator approval.',
      });
    }

    // Cap score at 100
    riskScore = Math.min(100, Math.max(0, riskScore));

    // Determine Risk Level
    let riskLevel: ReadinessRiskLevel = 'LOW';
    if (riskScore >= 80) riskLevel = 'CRITICAL';
    else if (riskScore >= 60) riskLevel = 'HIGH';
    else if (riskScore >= 40) riskLevel = 'ELEVATED';
    else if (riskScore >= 25) riskLevel = 'GUARDED';

    const riskAssessment: CityResponseReadinessRiskDto = {
      readinessId,
      readinessRiskScore: riskScore,
      riskLevel,
      contributingFactors,
      requiresHumanApproval: true,
      advisoryOnly: true,
    };

    entity.riskAssessment = riskAssessment;
    logger.info(`[CityResponseReadinessRiskService] Evaluated readiness risk for '${readinessId}': ${riskScore} (${riskLevel})`);
    return riskAssessment;
  }
}

export const cityResponseReadinessRiskService = new CityResponseReadinessRiskService();
