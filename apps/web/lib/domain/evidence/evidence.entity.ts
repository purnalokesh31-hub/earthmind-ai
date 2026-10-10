// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Evidence Aggregate Root
// Pure Domain Entity for Media Attachments, File Metadata, & Security Status
// ──────────────────────────────────────────────────────────────

import { EvidenceCategoryType, EvidenceSourceType, EvidenceStatus, EvidenceStatusType } from './evidence-status';
import { EvidenceValidator } from './evidence.validator';

export interface EvidenceProps {
  id: string;
  incidentId: string;
  uploaderId: string;
  fileName: string;
  fileUrl: string;
  mediaType: string;
  fileSizeBytes: number;
  checksumSha256?: string | null;
  category: EvidenceCategoryType;
  source: EvidenceSourceType;
  status: EvidenceStatusType;
  version: number;
  tags: string[];
  metadata?: Record<string, unknown> | null;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class EvidenceEntity {
  private props: EvidenceProps;

  constructor(props: EvidenceProps) {
    EvidenceValidator.validateFileSize(props.fileSizeBytes);
    EvidenceValidator.validateMimeType(props.mediaType);
    EvidenceValidator.validateIncidentAssociation(props.incidentId);
    EvidenceValidator.validateUploaderAssociation(props.uploaderId);

    this.props = {
      ...props,
      version: props.version || 1,
      tags: props.tags || [],
      metadata: props.metadata || {},
    };
  }

  get id(): string { return this.props.id; }
  get incidentId(): string { return this.props.incidentId; }
  get uploaderId(): string { return this.props.uploaderId; }
  get fileName(): string { return this.props.fileName; }
  get fileUrl(): string { return this.props.fileUrl; }
  get mediaType(): string { return this.props.mediaType; }
  get fileSizeBytes(): number { return this.props.fileSizeBytes; }
  get checksumSha256(): string | null | undefined { return this.props.checksumSha256; }
  get category(): EvidenceCategoryType { return this.props.category; }
  get source(): EvidenceSourceType { return this.props.source; }
  get status(): EvidenceStatusType { return this.props.status; }
  get version(): number { return this.props.version; }
  get tags(): string[] { return [...this.props.tags]; }
  get metadata(): Record<string, unknown> { return { ...this.props.metadata }; }
  get deletedAt(): Date | null | undefined { return this.props.deletedAt; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  transitionStatus(newStatus: EvidenceStatusType): void {
    if (!EvidenceStatus.canTransition(this.props.status, newStatus)) {
      throw new Error(`Invalid evidence status transition from '${this.props.status}' to '${newStatus}'`);
    }
    this.props.status = newStatus;
    this.props.updatedAt = new Date();
  }

  markDeleted(): void {
    this.transitionStatus('DELETED');
    this.props.deletedAt = new Date();
  }

  restore(): void {
    this.transitionStatus('ACTIVE');
    this.props.deletedAt = null;
  }

  addTag(tag: string): void {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !this.props.tags.includes(trimmed)) {
      this.props.tags.push(trimmed);
      this.props.updatedAt = new Date();
    }
  }

  toObject(): EvidenceProps {
    return { ...this.props };
  }
}
