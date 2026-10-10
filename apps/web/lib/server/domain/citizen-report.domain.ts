// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 6.12 Citizen Reporting Domain
// ──────────────────────────────────────────────────────────────

export type CitizenReportStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'RECEIVED'
  | 'AI_PROCESSING'
  | 'UNDER_REVIEW'
  | 'VERIFIED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'AWAITING_CITIZEN'
  | 'RESOLVED'
  | 'CITIZEN_VERIFIED'
  | 'REOPENED'
  | 'REJECTED'
  | 'DUPLICATE'
  | 'CLOSED';

export type CitizenReportCategory =
  | 'ROAD_DAMAGE'
  | 'FLOODING'
  | 'GARBAGE'
  | 'FIRE'
  | 'WATER_LEAKAGE'
  | 'ELECTRICITY'
  | 'BUILDING_DAMAGE'
  | 'ILLEGAL_DUMPING'
  | 'PUBLIC_SAFETY'
  | 'CROP_DAMAGE'
  | 'DRAINAGE'
  | 'STREET_LIGHT'
  | 'TRAFFIC'
  | 'OTHER';

export type CitizenVisibility = 'PUBLIC' | 'PRIVATE' | 'ANONYMOUS_PUBLIC';

export type CitizenReportLocationSource = 'DEVICE_GPS' | 'EXIF' | 'MANUAL' | 'UNKNOWN';

export interface CitizenConsent {
  dataProcessingConsent: boolean;
  publicDisplayConsent: boolean;
  contactConsent: boolean;
  consentedAt: Date;
}

export interface CitizenReportEntity {
  id: string;
  reportCode: string;
  citizenId: string;
  citizenNameMasked: string;
  category: CitizenReportCategory;
  title: string;
  description: string;
  locationName: string;
  latitude?: number;
  longitude?: number;
  locationSource: CitizenReportLocationSource;
  accuracyMeters?: number;
  cityId: string;
  zoneId?: string;
  status: CitizenReportStatus;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  visibility: CitizenVisibility;
  evidenceIds: string[];
  assignedIncidentId?: string;
  duplicateOfId?: string;
  consent: CitizenConsent;
  aiClassification?: {
    suggestedCategory: CitizenReportCategory;
    suggestedSeverity: string;
    suggestedDepartment: string;
    confidence: number;
    summary: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CitizenFeedbackEntity {
  id: string;
  reportId: string;
  citizenId: string;
  satisfactionScore: number; // 1 - 5
  resolutionQualityScore: number; // 1 - 5
  responseSpeedScore: number; // 1 - 5
  communicationQualityScore: number; // 1 - 5
  comments?: string;
  createdAt: Date;
}

export interface DuplicateCandidateDto {
  reportId: string;
  matchingReportId: string;
  similarityScore: number; // 0 - 100 %
  distanceMeters: number;
  reasoning: string[];
}
