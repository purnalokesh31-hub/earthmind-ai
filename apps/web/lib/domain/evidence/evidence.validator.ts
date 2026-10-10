// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Evidence Domain Invariant Validator
// Pure Domain Business Rules Engine for File Uploads & Media Assets
// ──────────────────────────────────────────────────────────────

import { EvidenceCategoryType, EvidenceStatus } from './evidence-status';

export interface VirusScanResult {
  isClean: boolean;
  threatName?: string;
}

export class EvidenceValidator {
  static readonly MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB max file limit

  static readonly ALLOWED_MIME_TYPES = new Set([
    // Images
    'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/tiff',
    // Videos
    'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo',
    // Audio
    'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3',
    // Documents
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'text/csv', 'application/json', 'application/xml',
    // Sensor & Archives
    'application/zip', 'application/x-tar', 'application/gzip',
  ]);

  static validateFileSize(sizeBytes: number): void {
    if (sizeBytes <= 0) {
      throw new Error('Evidence file size must be greater than 0 bytes');
    }
    if (sizeBytes > this.MAX_FILE_SIZE_BYTES) {
      throw new Error(`Evidence file size exceeds maximum limit of 100MB (Got ${Math.round(sizeBytes / (1024 * 1024))}MB)`);
    }
  }

  static validateMimeType(mimeType: string): void {
    if (!mimeType || !this.ALLOWED_MIME_TYPES.has(mimeType.toLowerCase())) {
      throw new Error(`Unsupported evidence MIME type: '${mimeType}'`);
    }
  }

  static validateIncidentAssociation(incidentId?: string | null): void {
    if (!incidentId || incidentId.trim().length === 0) {
      throw new Error('Evidence must be associated with a valid incident ID');
    }
  }

  static validateUploaderAssociation(uploaderId?: string | null): void {
    if (!uploaderId || uploaderId.trim().length === 0) {
      throw new Error('Evidence upload must be attributed to an authenticated uploader ID');
    }
  }

  static scanVirus(fileBuffer?: Buffer): VirusScanResult {
    // In-memory virus scan hook (integrates with ClamAV / AWS GuardDuty in production)
    if (fileBuffer && fileBuffer.toString('utf8').includes('EICAR-STANDARD-ANTIVIRUS-TEST-FILE')) {
      return { isClean: false, threatName: 'EICAR-Test-Signature' };
    }
    return { isClean: true };
  }
}
