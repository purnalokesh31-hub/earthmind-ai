// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.8 Cross-Domain Urban Intelligence Domain
// ──────────────────────────────────────────────────────────────

export type CorrelationType =
  | 'TEMPORAL'
  | 'SPATIAL'
  | 'CAUSAL'
  | 'OPERATIONAL'
  | 'RESOURCE'
  | 'SERVICE_IMPACT';

export type CascadeRiskClassification =
  | 'LOW'
  | 'GUARDED'
  | 'ELEVATED'
  | 'HIGH'
  | 'CRITICAL';

export type DomainType =
  | 'CLIMATE'
  | 'MOBILITY'
  | 'TRANSIT'
  | 'UTILITY'
  | 'EMERGENCY_RESPONSE'
  | 'CITIZEN_INTELLIGENCE';

export interface CrossDomainSignalDto {
  signalId: string;
  domain: DomainType;
  entityId: string;
  entityName: string;
  eventType: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  location: {
    lat: number;
    lng: number;
    zoneId?: string;
  };
  value: number;
  unit: string;
  timestamp: string;
  confidenceScore?: number;
}

export interface CrossDomainCorrelationDto {
  correlationId: string;
  sourceSignals: CrossDomainSignalDto[];
  affectedDomains: DomainType[];
  correlationType: CorrelationType;
  confidence: number; // 0 - 100
  causalChain: string[];
  affectedAssets: string[];
  affectedPopulation: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  explanation: string;
  timestamp: string;
}

export interface CitywideCascadeRiskDto {
  riskScore: number; // 0 - 100
  classification: CascadeRiskClassification;
  primaryFailure: {
    domain: DomainType;
    assetId: string;
    assetName: string;
    description: string;
  };
  secondaryFailures: Array<{
    domain: DomainType;
    assetId: string;
    description: string;
  }>;
  criticalDependency: string;
  highestRiskDomain: DomainType;
  highestRiskAsset: string;
  affectedPopulation: number;
  expectedServiceDisruption: string;
  propagationMetrics: {
    directImpactScore: number;
    secondaryImpactScore: number;
    tertiaryImpactScore: number;
    crossDomainPropagationDepth: number;
    responseDifficultyScore: number;
    recoveryComplexityScore: number;
    timeSensitivityScore: number;
  };
}

export interface UrbanPriorityItemDto {
  priorityRank: number; // 1-indexed
  correlationId: string;
  primaryDomain: DomainType;
  title: string;
  priorityScore: number; // 0 - 100
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  affectedPopulation: number;
  serviceCriticalityScore: number;
  cascadeRiskScore: number;
  timeSensitivityMinutes: number;
  recommendedAdvisoryAction: string;
  requiresHumanApproval: boolean; // Always true
}

export interface UrbanPriorityQueueDto {
  cityId: string;
  updatedAt: string;
  totalActiveItems: number;
  items: UrbanPriorityItemDto[];
}

export interface CityIntelligenceSummaryDto {
  cityId: string;
  cityName: string;
  overallCascadeRisk: CitywideCascadeRiskDto;
  activeCorrelations: CrossDomainCorrelationDto[];
  priorityQueue: UrbanPriorityQueueDto;
  timestamp: string;
}
