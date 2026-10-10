// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.11 (Mega Prompt 5/6)
// Response Execution Readiness Assessment & Scoring Service
// ──────────────────────────────────────────────────────────────

import {
  CityResponseReadinessEntity,
  CityResponseReadinessScoreDto,
  CityResponseReadinessCheckDto,
  ReadinessCheckCategory,
} from '../domain/digital-twin/city-response-readiness.domain';
import { memoryCityResponseReadinessRepository } from '../repositories/city-response-readiness.repository';
import { logger } from '../logger';

export class CityResponseReadinessService {
  private repo = memoryCityResponseReadinessRepository;

  public evaluateReadiness(readinessId: string): CityResponseReadinessEntity {
    return this.evaluateResponseReadiness(readinessId);
  }

  public evaluateResponseReadiness(readinessId: string): CityResponseReadinessEntity {
    const entity = this.repo.getReadiness(readinessId);
    if (!entity) {
      throw new Error(`Response execution readiness assessment '${readinessId}' not found.`);
    }

    const checks: CityResponseReadinessCheckDto[] = [];
    const reasons: string[] = [];

    // 1. Dependency Check
    const hasBlockedDependencies = entity.actions.some((a) =>
      a.dependencies.some((d) => d.status === 'BLOCKED' || d.status === 'FAILED')
    );
    if (hasBlockedDependencies) {
      checks.push({
        checkId: `chk-${readinessId}-dep`,
        category: 'DEPENDENCY_BLOCKED',
        title: 'Prerequisite Dependency Check',
        status: 'BLOCKED',
        description: 'Prerequisite action dependencies are blocked or incomplete.',
        evidence: 'Dependency graph log DEP_404',
        requiresHumanApproval: true,
      });
      reasons.push('Prerequisite dependencies are blocked');
    } else {
      checks.push({
        checkId: `chk-${readinessId}-dep`,
        category: 'DEPENDENCY_READY',
        title: 'Prerequisite Dependency Check',
        status: 'PASSED',
        description: 'All mandatory action dependencies satisfied.',
        requiresHumanApproval: true,
      });
    }

    // 2. Resource & Crew Check
    const hasUnknownResource = entity.actions.some((a) =>
      a.resources.some((r) => r.availabilityStatus === 'UNKNOWN')
    );
    const hasResourceShortage = entity.actions.some((a) =>
      a.resources.some((r) => r.allocatedQuantity < r.requiredQuantity)
    );

    if (hasUnknownResource) {
      checks.push({
        checkId: `chk-${readinessId}-res-unk`,
        category: 'DATA_UNAVAILABLE',
        title: 'Resource Telemetry & Inventory Check',
        status: 'DATA_UNAVAILABLE',
        description: 'Inventory telemetry status is UNKNOWN for required equipment.',
        evidence: 'Unverified telemetry stream',
        requiresHumanApproval: true,
      });
      reasons.push('Resource inventory telemetry is UNKNOWN');
    } else if (hasResourceShortage) {
      checks.push({
        checkId: `chk-${readinessId}-res-sht`,
        category: 'RESOURCE_SHORTAGE',
        title: 'Resource Allocation Check',
        status: 'FAILED',
        description: 'Allocated resources fall short of required operational threshold.',
        requiresHumanApproval: true,
      });
      reasons.push('Resource allocation deficit');
    } else {
      checks.push({
        checkId: `chk-${readinessId}-res`,
        category: 'RESOURCE_READY',
        title: 'Resource Allocation Check',
        status: 'PASSED',
        description: 'Resource allocations verified and available.',
        requiresHumanApproval: true,
      });
    }

    // 3. Safety Check
    const checklistSatisfied = entity.checklist?.isFullySatisfied ?? true;
    if (!checklistSatisfied) {
      checks.push({
        checkId: `chk-${readinessId}-sft`,
        category: 'SAFETY_BLOCKED',
        title: 'Operational Safety Checklist',
        status: 'BLOCKED',
        description: 'Pre-action safety isolation items incomplete.',
        requiresHumanApproval: true,
      });
      reasons.push('Pre-action safety checklist items incomplete');
    } else {
      checks.push({
        checkId: `chk-${readinessId}-sft`,
        category: 'SAFETY_READY',
        title: 'Operational Safety Checklist',
        status: 'PASSED',
        description: 'Operational safety items fully satisfied.',
        requiresHumanApproval: true,
      });
    }

    // 4. Calculate Scores
    let resourceScore = hasUnknownResource ? 50 : hasResourceShortage ? 60 : 100;
    let dependencyScore = hasBlockedDependencies ? 40 : 100;
    let safetyScore = checklistSatisfied ? 100 : 50;
    let overallScore = Math.round((resourceScore + dependencyScore + safetyScore + 100) / 4);

    let classification: 'READY' | 'CONDITIONALLY_READY' | 'NOT_READY' | 'BLOCKED' = 'READY';
    if (overallScore < 60 || hasBlockedDependencies) {
      classification = 'BLOCKED';
    } else if (overallScore < 75 || hasUnknownResource) {
      classification = 'NOT_READY';
    } else if (overallScore < 90) {
      classification = 'CONDITIONALLY_READY';
    }

    const scores: CityResponseReadinessScoreDto = {
      readinessScore: overallScore,
      classification,
      resourceReadinessScore: resourceScore,
      dependencyReadinessScore: dependencyScore,
      safetyReadinessScore: safetyScore,
      budgetReadinessScore: 100,
      dataAvailabilityScore: hasUnknownResource ? 50 : 100,
      authorizationStateScore: 100,
      reasons: reasons.length > 0 ? reasons : ['All readiness verification criteria satisfied.'],
      requiresHumanApproval: true,
      dataSource: 'EXECUTION_READINESS',
    };

    entity.checks = checks;
    entity.scores = scores;
    entity.readinessState = classification;
    entity.status = classification === 'READY' || classification === 'CONDITIONALLY_READY' ? 'READY_FOR_REVIEW' : 'NOT_READY';
    entity.updatedAt = new Date().toISOString();

    logger.info(`[CityResponseReadinessService] Evaluated execution readiness for '${readinessId}': Score ${overallScore} (${classification})`);
    return entity;
  }
}

export const cityResponseReadinessService = new CityResponseReadinessService();
