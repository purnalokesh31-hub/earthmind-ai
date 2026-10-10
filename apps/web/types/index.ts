// ──────────────────────────────────────────────────────────────
// EarthMind PIOS v1.0 — Core Type System
// ──────────────────────────────────────────────────────────────

export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type IncidentStatus =
  | 'reported'
  | 'evidence_collection'
  | 'ai_processing'
  | 'created'
  | 'verified'
  | 'assigned'
  | 'investigating'
  | 'resolved'
  | 'archived';
export type Category = 'infrastructure' | 'agriculture' | 'water' | 'energy' | 'climate' | 'environment' | 'wildlife' | 'disaster' | 'urban';

export type UserRole =
  | 'Citizen'
  | 'Field Officer'
  | 'Department Officer'
  | 'Supervisor'
  | 'Environmental Analyst'
  | 'Administrator';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  organization: string;
  department: string;
  role: UserRole;
  region: string;
  avatarUrl?: string;
  emailVerified: boolean;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  event: string;
  icon: string;
  actor?: string;
  stage?: string;
  department?: string;
  officer?: string;
  status?: string;
  remarks?: string;
  attachments?: string[];
}

export interface AIAnalysis {
  confidence: number;
  classification: string;
  severity: Severity;
  summary: string;
  recommendations: string[];
  estimatedCost?: string;
  estimatedETA?: string;
}

export interface Location {
  lat: number;
  lng: number;
  name: string;
  ward?: string;
  zone?: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  category: Category;
  severity: Severity;
  status: IncidentStatus;
  location: Location;
  reportedBy: string;
  assignedTo?: string;
  department?: string;
  reportedAt: string;
  updatedAt: string;
  resolvedAt?: string;
  imageUrl?: string;
  timeline: TimelineEvent[];
  aiAnalysis?: AIAnalysis;
  comments?: Comment[];
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  severity: Severity;
  category: Category;
  status: IncidentStatus;
  incidentId: string;
}

export interface KPI {
  label: string;
  value: string;
  trend: string;
  up: boolean;
  icon?: string;
}

export type NotificationEventType =
  | 'incident_created'
  | 'ai_analysis_completed'
  | 'officer_assigned'
  | 'priority_escalated'
  | 'evidence_uploaded'
  | 'field_update'
  | 'resolution_completed'
  | 'archive_completed';

export type NotificationPriorityGroup = 'P1_CRITICAL' | 'P2_HIGH' | 'P3_MEDIUM' | 'P4_INFO';

export interface Notification {
  id: string;
  eventType: NotificationEventType;
  priorityGroup: NotificationPriorityGroup;
  title: string;
  message: string;
  timestamp: string;
  status: 'unread' | 'read' | 'archived';
  incidentId?: string;
  actor?: string;
  type?: 'critical' | 'warning' | 'info' | 'success' | 'error';
  read?: boolean;
}

export interface ReportTemplate {
  id: string;
  label: string;
  icon: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'emergency';
}

// ── Navigation ──
export interface NavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
}

// ── Health Scores ──
export interface HealthScore {
  label: string;
  score: number;
  color: string;
  icon: string;
}

// ── Enterprise Telemetry Models ──
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  event?: string;
  action?: string;
  actor: string;
  department?: string;
  incidentId?: string;
  details?: string;
  metadata?: Record<string, any>;
}

export type UndoableActionType = 'archive' | 'delete' | 'resolve' | 'merge';

export interface UndoAction {
  id: string;
  type: UndoableActionType;
  description: string;
  timestamp: string;
  incidentId: string;
  previousState: {
    incident?: Incident;
    status?: IncidentStatus;
    mergedWithId?: string;
  };
}

export type EvidenceMediaType = 'image' | 'video' | 'document' | 'sensor';

export interface BoundingBox {
  id: string;
  label: string;
  confidence: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DetectionObject {
  id: string;
  class: string;
  label: string;
  confidence: number;
  category: string;
  boundingBox?: BoundingBox;
}

export interface OCRResult {
  extractedText: string;
  language: string;
  confidence: number;
  entities: Array<{ key: string; value: string }>;
}

export interface SensorTelemetry {
  sensorId: string;
  sensorType: string;
  unit: string;
  value: number;
  normalRange: { min: number; max: number };
  isAnomaly: boolean;
  rawPayload?: Record<string, any>;
}

export interface DamageAssessment {
  score: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  classification: string;
  affectedAssets: string[];
  estimatedCost: string;
}

export interface Recommendation {
  id: string;
  department: string;
  action: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  rationale: string;
}

export interface InferenceMetrics {
  processingTimeMs: number;
  fps?: number;
  deviceHardware: string;
  inferenceTimestamp: string;
}

export interface ModelInformation {
  name: string;
  version: string;
  framework: string;
  architecture: string;
  checkpointId: string;
}

export interface VisionAnalysisResult {
  id: string;
  evidenceId: string; // Link to EvidenceItem.id
  overallConfidence: number;
  detections: DetectionObject[];
  boundingBoxes: BoundingBox[];
  damageAssessment: DamageAssessment;
  recommendations: Recommendation[];
  ocr?: OCRResult;
  sensorTelemetry?: SensorTelemetry;
  metrics: InferenceMetrics;
  modelInfo: ModelInformation;
  analyzedAt: string;
}

export interface AIVisionAnalysis {
  objectsDetected: string[];
  overallConfidence: number;
  damageScore: number;
  classification: string;
  boundingBoxes: BoundingBox[];
  ocrText?: string;
  keyframes?: string[];
  sensorTelemetry?: Record<string, any>;
  recommendedDepartment: string;
  processingTimeMs: number;
}

// Stores ONLY uploaded evidence metadata
export interface EvidenceItem {
  id: string;
  name: string;
  url: string;
  type: EvidenceMediaType;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
  uploadedBy: string;
  linkedIncidentId?: string;
  status: 'processing' | 'analyzed' | 'failed' | 'pending';
  visionResultId?: string; // Link to VisionAnalysisResult.id
  aiAnalysis?: AIVisionAnalysis; // Compatibility alias
}

export interface EvidenceFile {
  id: string;
  incidentId: string;
  filename: string;
  url: string;
  uploadedAt: string;
  uploader: string;
  type: string; // mime type
}

export interface FieldUnitDispatch {
  id: string;
  incidentId: string;
  unitId: string;
  officerName: string;
  dispatchedAt: string;
  status: 'en_route' | 'on_site' | 'completed';
}

export interface AIConsequenceScore {
  incidentId: string;
  riskScore: number; // 0-100
  severity: Severity;
  confidence: number; // 0-100
  notes?: string;
}
export interface FieldAssignment {
  assignmentId: string;
  incidentId: string;
  officerId: string;
  officerName: string;
  departmentId: string;
  departmentName: string;
  unitId: string;
  unitName: string;
  vehicleId?: string;
  role: "Lead Officer" | "Field Officer" | "Supervisor" | "Emergency Response" | "Engineer";
  assignmentStatus: "Pending" | "Accepted" | "En Route" | "On Site" | "Completed";
  assignedAt: Date;
  estimatedArrival: Date;
  completedAt?: Date;
  remarks?: string;
}

export interface RiskAssessment {
  overallRiskScore: number;
  aiConfidence: number;
  severity: "Low" | "Medium" | "High" | "Critical";
  environmentalImpact: number;
  infrastructureImpact: number;
  publicSafetyImpact: number;
  economicImpact: number;
  urgencyLevel: number;
  priority: "Low" | "Medium" | "High" | "Critical";
  estimatedLoss: number;
  mitigationSuggestion: string;
  recommendedDepartments: string[];
}

export interface EarthImpactMetrics {
  planetaryHealthDelta: number;
  environmentalScore: number;
  waterImpact: number;
  energyImpact: number;
  agricultureImpact: number;
  biodiversityImpact: number;
  climateImpact: number;
  infrastructureImpact: number;
  populationAffected: number;
  estimatedRecoveryTime: string;
}

