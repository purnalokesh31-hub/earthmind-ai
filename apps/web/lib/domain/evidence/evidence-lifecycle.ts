// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Extended Evidence Lifecycle State Machine
// Supports full asynchronous processing states from UPLOADING to DELETED
// ──────────────────────────────────────────────────────────────

export type ExtendedEvidenceState =
  | 'UPLOADING'
  | 'UPLOADED'
  | 'VALIDATING'
  | 'VIRUS_SCANNING'
  | 'PROCESSING'
  | 'OCR_COMPLETE'
  | 'THUMBNAIL_READY'
  | 'AI_PENDING'
  | 'AI_COMPLETE'
  | 'VERIFIED'
  | 'ARCHIVED'
  | 'DELETED';

export class EvidenceLifecycle {
  static readonly TRANSITION_MATRIX: Record<ExtendedEvidenceState, ExtendedEvidenceState[]> = {
    UPLOADING: ['UPLOADED', 'DELETED'],
    UPLOADED: ['VALIDATING', 'DELETED'],
    VALIDATING: ['VIRUS_SCANNING', 'DELETED'],
    VIRUS_SCANNING: ['PROCESSING', 'DELETED'],
    PROCESSING: ['OCR_COMPLETE', 'THUMBNAIL_READY', 'AI_PENDING', 'DELETED'],
    OCR_COMPLETE: ['THUMBNAIL_READY', 'AI_PENDING', 'DELETED'],
    THUMBNAIL_READY: ['AI_PENDING', 'AI_COMPLETE', 'VERIFIED', 'DELETED'],
    AI_PENDING: ['AI_COMPLETE', 'VERIFIED', 'DELETED'],
    AI_COMPLETE: ['VERIFIED', 'ARCHIVED', 'DELETED'],
    VERIFIED: ['ARCHIVED', 'DELETED'],
    ARCHIVED: ['VERIFIED', 'DELETED'],
    DELETED: ['UPLOADING', 'VERIFIED'], // Restoration support
  };

  static canTransition(currentState: ExtendedEvidenceState, nextState: ExtendedEvidenceState): boolean {
    if (currentState === nextState) return true;
    return this.TRANSITION_MATRIX[currentState]?.includes(nextState) ?? false;
  }

  static validateTransition(currentState: ExtendedEvidenceState, nextState: ExtendedEvidenceState): void {
    if (!this.canTransition(currentState, nextState)) {
      throw new Error(`Illegal evidence lifecycle state transition from '${currentState}' to '${nextState}'`);
    }
  }
}
