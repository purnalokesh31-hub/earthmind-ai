// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Incident DTOs (Create, Update, Response)
// ──────────────────────────────────────────────────────────────

// ── Requests ──────────────────────────────────────────────────

export interface CreateIncidentDto {
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  severity?: 'critical' | 'high' | 'medium' | 'low' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | string;
  department?: string;
  departmentId?: string;
  locationName: string;
  lat?: number;
  lng?: number;
  address?: string;
  evidenceId?: string;
  evidenceIds?: string[];
  aiSummary?: string;
  repairCostEstimate?: number;
}

export interface UpdateIncidentDto {
  title?: string;
  description?: string;
  category?: string;
  subcategory?: string;
  status?: 'active' | 'dispatched' | 'resolved' | 'archived' | string;
  severity?: 'critical' | 'high' | 'medium' | 'low' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | string;
  department?: string;
  departmentId?: string;
  locationName?: string;
  lat?: number;
  lng?: number;
  assignedOfficerId?: string;
  aiSummary?: string;
  repairCostEstimate?: number;
}

export interface AssignOfficerDto {
  officerId: string;
  note?: string;
}

export interface UpdateIncidentStatusDto {
  status: 'active' | 'dispatched' | 'resolved' | 'archived' | string;
  reason?: string;
  note?: string;
}

// ── Responses ─────────────────────────────────────────────────

export interface IncidentResponseDto {
  id: string;
  incidentCode: string;
  title: string;
  description: string;
  status: string;
  severity: string;
  category: string;
  department: string;
  riskScore: number;
  locationName: string;
  lat?: number;
  lng?: number;
  assignedOfficerId?: string;
  evidenceId?: string;
  aiSummary?: string;
  repairCostEstimate?: number;
  createdAt: string;
  updatedAt: string;
}

export interface IncidentListResponseDto {
  incidents: IncidentResponseDto[];
  total: number;
  page: number;
  pageSize: number;
}

// ── Mapper: Entity → DTO ───────────────────────────────────────
export function toIncidentResponseDto(entity: any): IncidentResponseDto {
  return {
    id: entity.id,
    incidentCode: entity.incidentCode || entity.id,
    title: entity.title,
    description: entity.description,
    status: entity.status,
    severity: entity.severity,
    category: entity.category,
    department: entity.department,
    riskScore: entity.riskScore ?? 0,
    locationName: entity.locationName,
    lat: entity.lat,
    lng: entity.lng,
    assignedOfficerId: entity.assignedOfficerId,
    evidenceId: entity.evidenceId,
    aiSummary: entity.aiSummary,
    repairCostEstimate: entity.repairCostEstimate,
    createdAt: entity.createdAt instanceof Date ? entity.createdAt.toISOString() : (entity.createdAt || new Date().toISOString()),
    updatedAt: entity.updatedAt instanceof Date ? entity.updatedAt.toISOString() : (entity.updatedAt || new Date().toISOString()),
  };
}
