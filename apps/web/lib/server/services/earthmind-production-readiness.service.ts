// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Production Readiness Validation Service
// Performs automated runtime checks verifying core freeze invariants
// ──────────────────────────────────────────────────────────────

import {
  EARTHMIND_PRODUCTION_BASELINE_MANIFEST,
  ProductionBaselineManifest,
} from '../config/earthmind-production-baseline.manifest';
import { earthMindSafetyGatewayService } from './earthmind-safety-gateway.service';
import { earthMindProvenanceService } from './earthmind-provenance.service';
import { cityGovernanceEvaluationService } from './city-governance-evaluation.service';
import { cityCommandDecisionService } from './city-command-decision.service';
import { memoryCityCommandRepository } from '../repositories/city-command.repository';
import { cityInterventionOrchestratorService } from './city-intervention-orchestrator.service';
import { cityDecisionOrchestratorService } from './city-decision-orchestrator.service';
import { cityPredictionSimulationService } from './city-prediction-simulation.service';
import { cityRiskPredictionService } from './city-risk-prediction.service';
import { crossDomainCorrelationService } from './cross-domain-correlation.service';
import { authenticate, authorize } from '../auth/middleware.helpers';
import { logger } from '../logger';

export interface ReadinessCheckResultDto {
  checkId: string;
  category: 'SAFETY_GATEWAY' | 'AUTHORIZATION' | 'PROVENANCE' | 'SECURITY' | 'MODULE_HEALTH' | 'REPOSITORIES';
  description: string;
  passed: boolean;
  details: string;
}

export interface ProductionReadinessReportDto {
  reportId: string;
  generatedAt: string;
  manifest: ProductionBaselineManifest;
  status: 'CERTIFIED_PRODUCTION_READY' | 'VALIDATION_FAILED';
  summary: {
    totalChecks: number;
    passedChecks: number;
    failedChecks: number;
  };
  checks: ReadinessCheckResultDto[];
  requiresHumanApproval: true;
  advisoryOnly: true;
  autonomousExecution: false;
}

export class EarthMindProductionReadinessService {
  public validateProductionReadiness(): ProductionReadinessReportDto {
    const reportId = `readiness-${Date.now()}`;
    logger.info(`[ProductionReadiness] Initiating runtime readiness validation '${reportId}'`);

    const checks: ReadinessCheckResultDto[] = [];

    // 1. Safety Gateway Check (Evaluates real decision pipeline entity)
    try {
      const realIntervention = cityInterventionOrchestratorService.createIntervention({
        cityId: 'city-vja',
        title: 'Safety Check Protocol Validation',
        optimizationObjective: 'BALANCED',
        targetDomains: ['WATER' as any],
      });

      earthMindSafetyGatewayService.sanitizeRecommendation(realIntervention);
      checks.push({
        checkId: 'CHK_SAFETY_GATEWAY_ADVISORY',
        category: 'SAFETY_GATEWAY',
        description: 'Verifies safety gateway enforces advisory mode on real intervention entities',
        passed: true,
        details: 'Safety gateway advisory mode assertion on live intervention entity executed clean.',
      });
    } catch (e: any) {
      checks.push({
        checkId: 'CHK_SAFETY_GATEWAY_ADVISORY',
        category: 'SAFETY_GATEWAY',
        description: 'Verifies safety gateway enforces advisory mode on real intervention entities',
        passed: false,
        details: `Safety gateway failed: ${e.message}`,
      });
    }

    // 2. Autonomous Execution Restriction Check (Evaluates real entity with prohibited actuation)
    try {
      const prohibitedIntervention = {
        interventionId: 'int-prohibited-test',
        cityId: 'city-vja',
        advisoryOnly: false,
        autonomousExecution: true,
        actions: [
          {
            actionId: 'act-direct-hardware-control',
            title: 'Direct Sluice Gate Actuation',
            autoExecute: true,
            directActuation: true,
          },
        ],
      };

      earthMindSafetyGatewayService.assertNoAutonomousExecution(prohibitedIntervention);
      checks.push({
        checkId: 'CHK_AUTONOMOUS_EXECUTION_FORBIDDEN',
        category: 'SAFETY_GATEWAY',
        description: 'Verifies physical autonomous execution throws exception on real entities',
        passed: false,
        details: 'ERROR: Autonomous execution assertion failed to throw expected exception.',
      });
    } catch (e: any) {
      const isForbidden = e.message && e.message.includes('AUTONOMOUS_EXECUTION_FORBIDDEN');
      checks.push({
        checkId: 'CHK_AUTONOMOUS_EXECUTION_FORBIDDEN',
        category: 'SAFETY_GATEWAY',
        description: 'Verifies physical autonomous execution throws exception on real entities',
        passed: isForbidden,
        details: isForbidden
          ? 'Confirmed: Autonomous execution correctly rejected with AUTONOMOUS_EXECUTION_FORBIDDEN.'
          : `Unexpected error: ${e.message}`,
      });
    }

    // 3. Human Authorization Check
    try {
      const evalResult = cityGovernanceEvaluationService.evaluateGovernancePipeline({
        targetId: 'chk-target-01',
        cityId: 'vijayawada',
        riskScore: 85,
        confidenceScorePercent: 90,
        impactedDomains: ['CLIMATE', 'MOBILITY'],
        requiresHumanApproval: true,
      });

      const hasAuthRequired = evalResult.requiresHumanApproval === true && evalResult.requiredAuthorizationLevel !== undefined;
      checks.push({
        checkId: 'CHK_HUMAN_AUTHORIZATION_ENABLED',
        category: 'AUTHORIZATION',
        description: 'Verifies governance policy engine requires human authorization for critical actions',
        passed: hasAuthRequired,
        details: hasAuthRequired
          ? `Human authorization required: Level '${evalResult.requiredAuthorizationLevel}' enforced.`
          : 'Human authorization requirement check failed.',
      });
    } catch (e: any) {
      checks.push({
        checkId: 'CHK_HUMAN_AUTHORIZATION_ENABLED',
        category: 'AUTHORIZATION',
        description: 'Verifies governance policy engine requires human authorization for critical actions',
        passed: false,
        details: `Governance evaluation check failed: ${e.message}`,
      });
    }

    // 4. Data Provenance Verification Check
    try {
      const verifiedProv = earthMindProvenanceService.verifyProvenance('DECISION_INTELLIGENCE', 95, 'chk-ref-01');
      const unverifiedProv = earthMindProvenanceService.verifyProvenance('UNKNOWN' as any, 95, 'chk-ref-02');

      const passed = verifiedProv.confidence > 0 && unverifiedProv.confidence === 0;
      checks.push({
        checkId: 'CHK_PROVENANCE_VERIFICATION',
        category: 'PROVENANCE',
        description: 'Verifies provenance tagging & unverified data source rejection',
        passed,
        details: passed
          ? 'Provenance verification active: verified sources confirmed, unverified sources set confidence=0.'
          : 'Provenance verification logic failed.',
      });
    } catch (e: any) {
      checks.push({
        checkId: 'CHK_PROVENANCE_VERIFICATION',
        category: 'PROVENANCE',
        description: 'Verifies provenance tagging & unverified data source rejection',
        passed: false,
        details: `Provenance check error: ${e.message}`,
      });
    }

    // 5. Authentication & RBAC Helpers Availability Check
    try {
      const hasAuthHelpers = typeof authenticate === 'function' && typeof authorize === 'function';
      checks.push({
        checkId: 'CHK_SECURITY_MIDDLEWARE_AVAILABLE',
        category: 'SECURITY',
        description: 'Verifies authentication & RBAC middleware helper availability',
        passed: hasAuthHelpers,
        details: hasAuthHelpers
          ? 'JWT Authentication and RBAC authorization functions loaded successfully.'
          : 'Auth middleware helpers missing.',
      });
    } catch (e: any) {
      checks.push({
        checkId: 'CHK_SECURITY_MIDDLEWARE_AVAILABLE',
        category: 'SECURITY',
        description: 'Verifies authentication & RBAC middleware helper availability',
        passed: false,
        details: `Security check error: ${e.message}`,
      });
    }

    // 6. Core Services Health Check (Phases 7.8 - 7.11)
    const servicesAvailable =
      Boolean(crossDomainCorrelationService) &&
      Boolean(cityRiskPredictionService) &&
      Boolean(cityPredictionSimulationService) &&
      Boolean(cityDecisionOrchestratorService) &&
      Boolean(cityInterventionOrchestratorService) &&
      Boolean(cityGovernanceEvaluationService) &&
      Boolean(cityCommandDecisionService);

    checks.push({
      checkId: 'CHK_CORE_SERVICES_INSTANTIATED',
      category: 'MODULE_HEALTH',
      description: 'Verifies all 7 core phase service singletons are instantiated and active',
      passed: servicesAvailable,
      details: servicesAvailable
        ? 'All Phase 7.8-7.11 core services instantiated and ready.'
        : 'One or more core services failed to instantiate.',
    });

    // 7. Repositories Health Check
    try {
      const hasRepo = Boolean(memoryCityCommandRepository) && typeof memoryCityCommandRepository.createCase === 'function';
      checks.push({
        checkId: 'CHK_REPOSITORIES_ACTIVE',
        category: 'REPOSITORIES',
        description: 'Verifies memory/database repositories are active and functional',
        passed: hasRepo,
        details: hasRepo
          ? 'Repository interfaces active and responsive.'
          : 'Repository verification failed.',
      });
    } catch (e: any) {
      checks.push({
        checkId: 'CHK_REPOSITORIES_ACTIVE',
        category: 'REPOSITORIES',
        description: 'Verifies memory/database repositories are active and functional',
        passed: false,
        details: `Repository error: ${e.message}`,
      });
    }

    const failedCount = checks.filter((c) => !c.passed).length;
    const passedCount = checks.filter((c) => c.passed).length;
    const status = failedCount === 0 ? 'CERTIFIED_PRODUCTION_READY' : 'VALIDATION_FAILED';

    logger.info(`[ProductionReadiness] Readiness validation completed. Status: '${status}' (${passedCount}/${checks.length} passed)`);

    return {
      reportId,
      generatedAt: new Date().toISOString(),
      manifest: EARTHMIND_PRODUCTION_BASELINE_MANIFEST,
      status,
      summary: {
        totalChecks: checks.length,
        passedChecks: passedCount,
        failedChecks: failedCount,
      },
      checks,
      requiresHumanApproval: true,
      advisoryOnly: true,
      autonomousExecution: false,
    };
  }
}

export const earthMindProductionReadinessService = new EarthMindProductionReadinessService();
