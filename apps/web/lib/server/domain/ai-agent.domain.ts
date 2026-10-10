// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 6.13 Enterprise AI Agent Domain
// ──────────────────────────────────────────────────────────────

export type AgentState =
  | 'IDLE'
  | 'RECEIVING'
  | 'RETRIEVING'
  | 'ANALYZING'
  | 'REASONING'
  | 'GENERATING_RECOMMENDATION'
  | 'WAITING_FOR_APPROVAL'
  | 'EXECUTING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export type AgentTaskType =
  | 'INCIDENT_ANALYSIS'
  | 'RISK_ANALYSIS'
  | 'RESOURCE_PLANNING'
  | 'DISPATCH_ANALYSIS'
  | 'PREDICTION_ANALYSIS'
  | 'CROSS_CITY_ANALYSIS'
  | 'CITIZEN_REPORT_ANALYSIS'
  | 'EVIDENCE_ANALYSIS'
  | 'SITUATION_SUMMARY'
  | 'DECISION_SUPPORT'
  | 'EMERGENCY_BRIEFING'
  | 'DAILY_OPERATIONS_BRIEF'
  | 'CUSTOM_QUERY';

export interface KnowledgeCitationDto {
  sourceType: 'INCIDENT' | 'EVIDENCE' | 'PREDICTION' | 'WARNING' | 'GIS_ZONE' | 'CITIZEN_REPORT' | 'AUDIT_LOG';
  sourceId: string;
  title: string;
  relevantField?: string;
  timestamp: string;
  geographicScope?: string;
  confidence?: number;
  relevanceScore?: number;
  citationReference: string;
}

export interface ToolInvocationDto {
  toolId: string;
  toolName: string;
  inputParameters: Record<string, any>;
  outputSummary: string;
  executionDurationMs: number;
  readOnly: boolean;
  status: 'SUCCESS' | 'FAILED' | 'UNAUTHORIZED';
}

export interface ReasoningResultDto {
  situationSummary: string;
  importantSignals: string[];
  evidenceCitations: KnowledgeCitationDto[];
  riskFactors: string[];
  constraints: string[];
  possibleOptions: string[];
  recommendedOption: string;
  expectedImpact: string;
  confidenceScore: number; // 0 - 100 %
  requiresHumanApproval: boolean;
  conflictingInformation?: string[];
}

export interface RecommendationDto {
  recommendationId: string;
  type: 'ALLOCATE_RESOURCE' | 'ESCALATE_INCIDENT' | 'REASSIGN_DISPATCH' | 'PRIORITIZE_INCIDENT' | 'INSPECT_ZONE' | 'PREPOSITION_RESOURCE' | 'ISSUE_OPERATIONAL_ADVISORY';
  title: string;
  description: string;
  targetDepartment: string;
  jurisdiction: string;
  reasoning: ReasoningResultDto;
  requiresHumanApproval: boolean;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DEFERRED';
}

export interface AgentExecutionTraceDto {
  traceId: string;
  taskId: string;
  stepName: 'QUERY_RECEIVED' | 'CONTEXT_RETRIEVED' | 'TOOL_SELECTED' | 'TOOL_EXECUTED' | 'KNOWLEDGE_VALIDATED' | 'REASONING_COMPLETED' | 'RECOMMENDATION_GENERATED' | 'APPROVAL_REQUESTED' | 'APPROVED' | 'REJECTED' | 'EXECUTED' | 'FAILED' | 'COMPLETED';
  timestamp: string;
  durationMs: number;
  details: string;
}

export interface ApprovalRequestDto {
  recommendationId: string;
  userId: string;
  userRole: string;
  decision: 'APPROVE' | 'REJECT' | 'DEFER';
  reasonNote?: string;
  timestamp: string;
}

export interface AgentTaskEntity {
  taskId: string;
  correlationId: string;
  taskType: AgentTaskType;
  requestingUser: string;
  jurisdiction: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: AgentState;
  requestedQuery: string;
  retrievedKnowledgeCount: number;
  toolInvocations: ToolInvocationDto[];
  reasoningOutput?: ReasoningResultDto;
  recommendation?: RecommendationDto;
  executionTrace: AgentExecutionTraceDto[];
  createdAt: Date;
  updatedAt: Date;
}

export interface EmergencyBriefingDto {
  briefingId: string;
  title: string;
  briefingType: 'INCIDENT' | 'CITY' | 'REGIONAL' | 'DAILY_OPERATIONS';
  jurisdictionName: string;
  currentSituation: string;
  criticalIncidentsCount: number;
  activeWarningsCount: number;
  predictedRisksCount: number;
  resourceAvailability: string;
  topPriorities: string[];
  citations: KnowledgeCitationDto[];
  generatedAt: string;
}
