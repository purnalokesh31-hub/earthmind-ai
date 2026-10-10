// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.11 (Mega Prompt 6/6)
// Centralized EarthMind Safety Gateway Service
// Hardened Runtime Enforcement of "EarthMind Recommends, Human Operators Decide"
// ──────────────────────────────────────────────────────────────

import { logger } from '../logger';

export class EarthMindSafetyGatewayService {
  public readonly ADVISORY_ONLY = true;
  public readonly HUMAN_APPROVAL_REQUIRED = true;
  public readonly AUTONOMOUS_EXECUTION_FORBIDDEN = true;

  public assertAdvisoryMode<T extends Record<string, any>>(obj: T): T {
    if (!obj || typeof obj !== 'object') {
      throw new Error('AUTONOMOUS_EXECUTION_FORBIDDEN: Invalid safety target. Actual entity required.');
    }

    if (
      obj.advisoryOnly === false ||
      obj.autonomousExecution === true ||
      obj.executionMode === 'AUTONOMOUS' ||
      obj.executionMode === 'LIVE_WRITE' ||
      obj.executionMode === 'PHYSICAL_EXECUTION'
    ) {
      logger.error('[SafetyGateway] Violation: advisoryOnly must be true and autonomous execution modes prohibited.');
      throw new Error('AUTONOMOUS_EXECUTION_FORBIDDEN: EarthMind PIOS must operate strictly in advisory mode.');
    }
    return { ...obj, advisoryOnly: true, autonomousExecution: false };
  }

  public assertHumanApprovalRequired<T extends Record<string, any>>(obj: T): T {
    if (!obj || typeof obj !== 'object') {
      throw new Error('AUTONOMOUS_EXECUTION_FORBIDDEN: Invalid safety target. Actual entity required.');
    }

    if (
      obj.requiresHumanApproval === false ||
      obj.bypassApproval === true ||
      obj.skipHumanReview === true ||
      obj.autoApprove === true
    ) {
      logger.error('[SafetyGateway] Violation: requiresHumanApproval must be true.');
      throw new Error('AUTONOMOUS_EXECUTION_FORBIDDEN: Human operator authorization is mandatory.');
    }
    return { ...obj, requiresHumanApproval: true };
  }

  public assertNoAutonomousExecution<T extends Record<string, any>>(obj: T): T {
    if (!obj || typeof obj !== 'object') {
      throw new Error('AUTONOMOUS_EXECUTION_FORBIDDEN: Invalid safety target. Actual entity required.');
    }

    if (
      obj.autonomousExecution === true ||
      obj.autoExecute === true ||
      obj.autoDeploy === true ||
      obj.directActuation === true ||
      obj.physicalActuation === true ||
      obj.executionMode === 'AUTONOMOUS' ||
      obj.executionMode === 'PHYSICAL_EXECUTION' ||
      obj.executionMode === 'LIVE_WRITE'
    ) {
      logger.error('[SafetyGateway] Violation: autonomousExecution must be false and physical actuation is forbidden.');
      throw new Error('AUTONOMOUS_EXECUTION_FORBIDDEN: Autonomous physical deployment, emergency activation, or crew dispatch is strictly forbidden.');
    }

    // Deep-inspect nested actions/candidates if present
    if (Array.isArray(obj.actions)) {
      for (const action of obj.actions) {
        if (action && typeof action === 'object') {
          if (action.autoExecute === true || action.autonomousExecution === true || action.directActuation === true) {
            throw new Error(`AUTONOMOUS_EXECUTION_FORBIDDEN: Action '${action.actionId || action.title}' contains autonomous actuation flag.`);
          }
        }
      }
    }

    if (Array.isArray(obj.candidates)) {
      for (const cand of obj.candidates) {
        if (cand && typeof cand === 'object') {
          if (cand.autoExecute === true || cand.autonomousExecution === true || cand.directActuation === true) {
            throw new Error(`AUTONOMOUS_EXECUTION_FORBIDDEN: Candidate '${cand.candidateId || cand.title}' contains autonomous actuation flag.`);
          }
        }
      }
    }

    return { ...obj, autonomousExecution: false };
  }

  public validateProvenance(dataSource?: string): string {
    const valid = [
      'LIVE_TELEMETRY',
      'PREDICTION',
      'SIMULATION',
      'DECISION_INTELLIGENCE',
      'INTERVENTION_PLANNING',
      'EXECUTION_READINESS',
      'OUTCOME_VALIDATION',
      'OPERATOR_INPUT',
      'ESTIMATION',
    ];
    if (!dataSource || !valid.includes(dataSource)) {
      logger.warn(`[SafetyGateway] Unverified provenance '${dataSource}'. Defaulting to UNKNOWN.`);
      return 'UNKNOWN';
    }
    return dataSource;
  }

  public validateOperatorAuthorization(userId?: string, role?: string): boolean {
    if (!userId) {
      throw new Error('UNAUTHORIZED: Operator identity is required for decision recording.');
    }
    return true;
  }

  public sanitizeRecommendation<T extends Record<string, any>>(recommendation: T): T {
    this.assertAdvisoryMode(recommendation);
    this.assertHumanApprovalRequired(recommendation);
    this.assertNoAutonomousExecution(recommendation);
    return {
      ...recommendation,
      requiresHumanApproval: true,
      advisoryOnly: true,
      autonomousExecution: false,
    };
  }
}

export const earthMindSafetyGatewayService = new EarthMindSafetyGatewayService();
