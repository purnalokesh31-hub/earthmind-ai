// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.11 Mega Prompt 1/6
// City Governance Human Authorization Level Engine Service
// ──────────────────────────────────────────────────────────────

import {
  GovernanceAuthorizationLevel,
  GovernanceRiskTier,
  GovernanceProvenanceType,
} from '../domain/digital-twin/city-governance.domain';
import { logger } from '../logger';

// Keyed on the real RoleType enum (prisma/schema.prisma) — this previously used role strings
// (e.g. 'CITY_COMMANDER') that don't exist anywhere in the actual auth system, so every real
// account except a literal 'SYSTEM_ADMIN' silently fell through to the lowest tier (OPERATOR),
// both over-authorizing low-tier cases for any authenticated role and blocking real Commanders
// from ever clearing anything above the lowest authorization level.
const ROLE_TO_AUTHORIZATION_LEVEL: Record<string, GovernanceAuthorizationLevel> = {
  CITIZEN: 'OPERATOR',
  VIEWER: 'OPERATOR',
  AUDITOR: 'OPERATOR',
  ANALYST: 'OPERATOR',
  FIELD_OFFICER: 'SENIOR_OPERATOR',
  SUPERVISOR: 'DOMAIN_MANAGER',
  COMMANDER: 'CITY_COMMANDER',
  SYSTEM_ADMIN: 'EMERGENCY_COMMANDER',
};

export interface AuthorizationRequirementResult {
  requiredAuthorizationLevel: GovernanceAuthorizationLevel;
  minRolePermission: string;
  explanation: string;
  requiresDoubleSignOff: boolean;
  provenance: GovernanceProvenanceType;
  requiresHumanApproval: true;
}

export class CityGovernanceAuthorizationService {
  public determineRequiredAuthorization(
    riskTier: GovernanceRiskTier,
    impactedDomainCount: number,
    financialImpactUsd: number = 0,
    populationImpactCount: number = 0,
    provenance: GovernanceProvenanceType = 'GOVERNANCE'
  ): AuthorizationRequirementResult {
    let requiredLevel: GovernanceAuthorizationLevel = 'OPERATOR';
    let requiresDoubleSignOff = false;
    let minPermission = 'simulation:approve';
    let explanation = '';

    if (riskTier === 'CRITICAL' || populationImpactCount > 50000 || financialImpactUsd > 100000) {
      requiredLevel = 'EMERGENCY_COMMANDER';
      requiresDoubleSignOff = true;
      minPermission = 'emergency:authorize';
      explanation = `Critical multi-domain impact (${populationImpactCount.toLocaleString()} residents, $${financialImpactUsd.toLocaleString()}). Mandatory Emergency Commander authorization & dual sign-off required.`;
    } else if (riskTier === 'HIGH' || impactedDomainCount >= 3 || populationImpactCount > 20000) {
      requiredLevel = 'CITY_COMMANDER';
      requiresDoubleSignOff = true;
      minPermission = 'city:authorize';
      explanation = `High impact cascade across ${impactedDomainCount} domains affecting ${populationImpactCount.toLocaleString()} residents. City Commander authorization required.`;
    } else if (riskTier === 'ELEVATED' || impactedDomainCount >= 2) {
      requiredLevel = 'DOMAIN_MANAGER';
      minPermission = 'domain:approve';
      explanation = `Elevated multi-domain impact across ${impactedDomainCount} domains. Domain Manager authorization required.`;
    } else if (riskTier === 'GUARDED') {
      requiredLevel = 'SENIOR_OPERATOR';
      minPermission = 'operator:senior_approve';
      explanation = `Guarded operational risk. Senior Operator authorization required.`;
    } else {
      requiredLevel = 'OPERATOR';
      minPermission = 'simulation:approve';
      explanation = `Low risk operational impact. Standard Operator authorization required.`;
    }

    logger.info(`[CityGovernanceAuthorizationService] Risk ${riskTier} -> Required Auth: ${requiredLevel}`);

    return {
      requiredAuthorizationLevel: requiredLevel,
      minRolePermission: minPermission,
      explanation,
      requiresDoubleSignOff,
      provenance,
      requiresHumanApproval: true,
    };
  }

  /**
   * Maps a real RoleType (prisma/schema.prisma) to its governance authorization tier.
   * Single source of truth — route handlers must call this rather than keeping their own copy.
   */
  public mapRoleToAuthorizationLevel(userRole: string): GovernanceAuthorizationLevel {
    return ROLE_TO_AUTHORIZATION_LEVEL[userRole] || 'OPERATOR';
  }

  public validateUserAuthorization(
    userRole: string,
    requiredLevel: GovernanceAuthorizationLevel
  ): { isAuthorized: boolean; reason: string } {
    const hierarchy: Record<GovernanceAuthorizationLevel, number> = {
      OPERATOR: 1,
      SENIOR_OPERATOR: 2,
      DOMAIN_MANAGER: 3,
      CITY_COMMANDER: 4,
      EMERGENCY_COMMANDER: 5,
    };

    const userLevel = this.mapRoleToAuthorizationLevel(userRole);
    const userRank = hierarchy[userLevel];
    const requiredRank = hierarchy[requiredLevel];

    if (userRank >= requiredRank) {
      return {
        isAuthorized: true,
        reason: `User role '${userRole}' (${userLevel}) satisfies or exceeds required authorization level '${requiredLevel}'.`,
      };
    }

    return {
      isAuthorized: false,
      reason: `User role '${userRole}' (${userLevel}) is insufficient for required authorization level '${requiredLevel}'.`,
    };
  }
}

export const cityGovernanceAuthorizationService = new CityGovernanceAuthorizationService();
