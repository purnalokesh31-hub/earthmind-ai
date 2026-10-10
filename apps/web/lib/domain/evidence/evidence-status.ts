// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Evidence Status State Machine & Media Categories
// ──────────────────────────────────────────────────────────────

export type EvidenceStatusType = 'ACTIVE' | 'FLAGGED' | 'ARCHIVED' | 'DELETED';
export type EvidenceSourceType = 'OFFICER_UPLOAD' | 'CITIZEN_REPORT' | 'SATELLITE' | 'DRONE_STREAM' | 'IOT_SENSOR';
export type EvidenceCategoryType = 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'SENSOR_DATA' | 'ARCHIVE';

export class EvidenceStatus {
  static readonly ALLOWED_TRANSITIONS: Record<EvidenceStatusType, EvidenceStatusType[]> = {
    ACTIVE: ['FLAGGED', 'ARCHIVED', 'DELETED'],
    FLAGGED: ['ACTIVE', 'DELETED'],
    ARCHIVED: ['ACTIVE', 'DELETED'],
    DELETED: ['ACTIVE'], // Restore capability
  };

  static canTransition(from: EvidenceStatusType, to: EvidenceStatusType): boolean {
    if (from === to) return true;
    return this.ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
  }

  static categorizeMimeType(mimeType: string): EvidenceCategoryType {
    const lower = mimeType.toLowerCase();
    if (lower.startsWith('image/')) return 'IMAGE';
    if (lower.startsWith('video/')) return 'VIDEO';
    if (lower.startsWith('audio/')) return 'AUDIO';
    if (lower.includes('pdf') || lower.includes('word') || lower.includes('excel') || lower.includes('text')) return 'DOCUMENT';
    if (lower.includes('json') || lower.includes('csv') || lower.includes('xml')) return 'SENSOR_DATA';
    if (lower.includes('zip') || lower.includes('tar') || lower.includes('gz')) return 'ARCHIVE';
    return 'DOCUMENT';
  }
}
