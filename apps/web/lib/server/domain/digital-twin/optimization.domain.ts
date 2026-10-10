// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.3 Autonomous Infrastructure Optimization Domain
// ──────────────────────────────────────────────────────────────

export type OptimizationScenarioStatus =
  | 'DRAFT'
  | 'CONFIGURED'
  | 'QUEUED'
  | 'ANALYZING'
  | 'OPTIMIZING'
  | 'REVIEWING'
  | 'AWAITING_APPROVAL'
  | 'APPROVED'
  | 'EXECUTING'
  | 'COMPLETED'
  | 'REJECTED'
  | 'FAILED'
  | 'CANCELLED';

export type OptimizationObjectiveType =
  | 'MINIMIZE_RISK'
  | 'MINIMIZE_COST'
  | 'MINIMIZE_RESPONSE_TIME'
  | 'MAXIMIZE_ASSET_AVAILABILITY'
  | 'MAXIMIZE_SERVICE_COVERAGE'
  | 'BALANCED_MULTI_OBJECTIVE';

export type OptimizationRecommendationType =
  | 'PREVENTIVE_MAINTENANCE'
  | 'EMERGENCY_MAINTENANCE'
  | 'RESOURCE_REALLOCATION'
  | 'TEAM_REASSIGNMENT'
  | 'EQUIPMENT_ALLOCATION'
  | 'INSPECTION_PRIORITY'
  | 'ASSET_REPLACEMENT'
  | 'ROUTE_OPTIMIZATION'
  | 'BUDGET_PRIORITIZATION';

export interface OptimizationConstraintDto {
  constraintId: string;
  type: 'MAX_BUDGET' | 'MAX_TEAM_WORKLOAD' | 'MAX_RESPONSE_TIME' | 'REQUIRED_SKILL' | 'JURISDICTION_BOUNDARY';
  limitValue: number;
  unit?: string;
  isHardConstraint: boolean;
}

export interface OptimizationObjectiveDto {
  type: OptimizationObjectiveType;
  riskWeight: number; // Sum to 1.0
  costWeight: number;
  responseTimeWeight: number;
  availabilityWeight: number;
}

export interface ResourceAllocationDto {
  allocationId: string;
  resourceId: string;
  resourceName: string;
  resourceType: 'RESPONSE_TEAM' | 'MAINTENANCE_TEAM' | 'PUMP_EQUIPMENT' | 'EMERGENCY_VEHICLE';
  assignedAssetId?: string;
  assignedZoneId: string;
  currentLocation: string;
  targetLocation: string;
  estimatedArrivalMinutes: number;
  workloadScore: number; // 0 - 100
  status: 'OPTIMAL' | 'SUB_OPTIMAL' | 'REALLOCATED';
}

export interface MaintenancePlanDto {
  planId: string;
  targetAssetId: string;
  targetAssetName: string;
  assetConditionScore: number;
  predictiveRiskScore: number;
  maintenancePriorityScore: number; // 0 - 100
  priorityLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  recommendedAction: string;
  estimatedDurationHours: number;
  estimatedCostInr: number;
}

export interface OptimizationCandidatePlanDto {
  planId: string;
  title: string;
  strategyName: string;
  normalizedScore: number; // 0 - 100
  riskReductionPercent: number;
  estimatedCostInr: number;
  estimatedResponseTimeMinutes: number;
  resourceUtilizationPercent: number;
  feasibilityStatus: 'FEASIBLE' | 'INFEASIBLE';
  advantages: string[];
  disadvantages: string[];
  maintenancePlans: MaintenancePlanDto[];
  resourceAllocations: ResourceAllocationDto[];
}

export interface OptimizationRecommendationDto {
  recommendationId: string;
  scenarioId: string;
  type: OptimizationRecommendationType;
  title: string;
  description: string;
  targetJurisdiction: string;
  selectedPlan: OptimizationCandidatePlanDto;
  alternativePlans: OptimizationCandidatePlanDto[];
  scoringFactors: {
    riskReduction: number;
    slaImprovement: number;
    costEfficiency: number;
    resourceEfficiency: number;
    finalScore: number;
  };
  requiresHumanApproval: boolean; // Always true
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface OptimizationScenarioEntity {
  scenarioId: string;
  title: string;
  description: string;
  cityId: string;
  simulationScenarioId?: string; // Optional Phase 7.2 integration link
  status: OptimizationScenarioStatus;
  objectives: OptimizationObjectiveDto;
  constraints: OptimizationConstraintDto[];
  totalBudgetInr: number;
  recommendation?: OptimizationRecommendationDto;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}
