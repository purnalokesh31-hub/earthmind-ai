// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Evidence DTOs (Create, Update, Response, Metadata, Summary)
// ──────────────────────────────────────────────────────────────

// ── Requests ──────────────────────────────────────────────────

export interface CreateEvidenceDto {
  fileName: string;
  fileType: 'image' | 'video' | 'document' | 'sensor';
  mimeType: string;
  sizeBytes: number;
  linkedIncidentId?: string;
}

export interface UploadEvidenceDto {
  incidentId: string;
  fileName: string;
  mimeType: string;
  fileSizeBytes: number;
  checksumSha256?: string;
  source?: 'OFFICER_UPLOAD' | 'CITIZEN_REPORT' | 'SATELLITE' | 'DRONE_STREAM' | 'IOT_SENSOR';
  tags?: string[];
}

export interface UpdateEvidenceDto {
  status?: 'pending' | 'processing' | 'analyzed' | 'failed' | 'ACTIVE' | 'FLAGGED' | 'ARCHIVED';
  linkedIncidentId?: string;
  ocrText?: string;
  aiConfidence?: number;
  aiTaskLabel?: string;
  damageScore?: number;
  tags?: string[];
}

export interface LinkEvidenceToIncidentDto {
  incidentId: string;
}

// ── Metadata & Summary DTOs ────────────────────────────────────

export interface EvidenceMetadataDto {
  dimensions?: { width: number; height: number };
  durationSeconds?: number;
  encoding?: string;
  deviceModel?: string;
  latitude?: number;
  longitude?: number;
  timestamp?: string;
  checksumSha256?: string;
  virusScanned?: boolean;
}

export interface EvidenceSummaryDto {
  id: string;
  incidentId: string;
  fileName: string;
  category: string;
  mediaType: string;
  fileSizeBytes: number;
  fileUrl: string;
  status: string;
  createdAt: string;
}

// ── Responses ─────────────────────────────────────────────────

export interface EvidenceResponseDto {
  id: string;
  fileName: string;
  fileType: string;
  mimeType: string;
  sizeBytes: number;
  storageUrl: string;
  status: string;
  linkedIncidentId?: string;
  uploadedByUserId: string;
  ocrText?: string;
  aiConfidence?: number;
  aiTaskLabel?: string;
  damageScore?: number;
  metadata?: EvidenceMetadataDto;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface EvidenceUploadResponseDto {
  evidenceId: string;
  uploadUrl: string;
  fileType: string;
  status: 'pending' | 'ACTIVE';
}

export interface EvidenceListResponseDto {
  items: EvidenceResponseDto[];
  total: number;
}

// ── Mapper: Entity → DTO ───────────────────────────────────────
export function toEvidenceResponseDto(entity: any): EvidenceResponseDto {
  return {
    id: entity.id,
    fileName: entity.fileName,
    fileType: entity.fileType || entity.category || 'document',
    mimeType: entity.mimeType || entity.mediaType || 'application/octet-stream',
    sizeBytes: entity.sizeBytes || entity.fileSizeBytes || 0,
    storageUrl: entity.storageUrl || entity.fileUrl || '',
    status: entity.status || 'ACTIVE',
    linkedIncidentId: entity.linkedIncidentId || entity.incidentId,
    uploadedByUserId: entity.uploadedByUserId || entity.uploaderId || 'anonymous',
    ocrText: entity.ocrText,
    aiConfidence: entity.aiConfidence,
    aiTaskLabel: entity.aiTaskLabel,
    damageScore: entity.damageScore,
    metadata: entity.metadata,
    tags: entity.tags || [],
    createdAt: entity.createdAt?.toISOString?.() ?? new Date(entity.createdAt || Date.now()).toISOString(),
    updatedAt: entity.updatedAt?.toISOString?.() ?? new Date(entity.updatedAt || Date.now()).toISOString(),
  };
}
