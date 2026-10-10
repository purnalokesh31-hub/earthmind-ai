// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Evidence Domain Aggregate Factory
// Creates Validated Evidence Entity Aggregates
// ──────────────────────────────────────────────────────────────

import { EvidenceEntity, EvidenceProps } from './evidence.entity';
import { EvidenceCategoryType, EvidenceSourceType, EvidenceStatus } from './evidence-status';

export interface CreateEvidenceParams {
  id?: string;
  incidentId: string;
  uploaderId: string;
  fileName: string;
  fileUrl: string;
  mediaType: string;
  fileSizeBytes: number;
  checksumSha256?: string;
  source?: EvidenceSourceType;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export class EvidenceFactory {
  static create(params: CreateEvidenceParams): EvidenceEntity {
    const id = params.id || `evd-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const category: EvidenceCategoryType = EvidenceStatus.categorizeMimeType(params.mediaType);
    const now = new Date();

    const props: EvidenceProps = {
      id,
      incidentId: params.incidentId,
      uploaderId: params.uploaderId,
      fileName: params.fileName,
      fileUrl: params.fileUrl,
      mediaType: params.mediaType,
      fileSizeBytes: params.fileSizeBytes,
      checksumSha256: params.checksumSha256 || null,
      category,
      source: params.source || 'OFFICER_UPLOAD',
      status: 'ACTIVE',
      version: 1,
      tags: params.tags || [],
      metadata: params.metadata || {},
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    return new EvidenceEntity(props);
  }
}
