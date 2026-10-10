// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Evidence Service
// ──────────────────────────────────────────────────────────────
// Manages evidence upload, metadata extraction, incident linking,
// and audit logging. Connects directly to Zustand SSOT.
// ──────────────────────────────────────────────────────────────

import { useAppStore } from '../../stores/app-store';
import type { EvidenceItem, EvidenceMediaType } from '../../types';

// Mock delay helper
const mockDelay = (ms = 150): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export interface EvidenceServiceUploadOptions {
  name: string;
  type: EvidenceMediaType;
  url?: string;
  mimeType?: string;
  sizeBytes?: number;
  linkedIncidentId?: string;
}

export class EvidenceService {
  /**
   * Uploads an evidence file, extracts metadata, logs audit trail, and triggers Zustand SSOT update.
   */
  static async uploadEvidence(options: EvidenceServiceUploadOptions): Promise<EvidenceItem> {
    await mockDelay(200);

    const store = useAppStore.getState();
    const item = await store.uploadEvidence({
      name: options.name,
      type: options.type,
      url: options.url || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&auto=format&fit=crop&q=80',
      mimeType: options.mimeType || (options.type === 'image' ? 'image/jpeg' : options.type === 'video' ? 'video/mp4' : 'application/pdf'),
      sizeBytes: options.sizeBytes || 2850000,
      linkedIncidentId: options.linkedIncidentId,
    });

    return item;
  }

  /**
   * Retrieves an evidence item by ID.
   */
  static async getEvidenceById(id: string): Promise<EvidenceItem | null> {
    await mockDelay(50);
    const store = useAppStore.getState();
    return store.evidenceList.find((e) => e.id === id) || null;
  }

  /**
   * Lists all evidence items, optionally filtered by incidentId.
   */
  static async listEvidence(incidentId?: string): Promise<EvidenceItem[]> {
    await mockDelay(50);
    const store = useAppStore.getState();
    if (incidentId) {
      return store.evidenceList.filter((e) => e.linkedIncidentId === incidentId);
    }
    return store.evidenceList;
  }

  /**
   * Links an evidence asset to an incident.
   */
  static async linkEvidenceToIncident(evidenceId: string, incidentId: string): Promise<boolean> {
    await mockDelay(100);
    const store = useAppStore.getState();
    store.linkEvidenceToIncident(evidenceId, incidentId);
    return true;
  }

  /**
   * Creates a new incident automatically from analyzed evidence.
   */
  static async createIncidentFromEvidence(evidenceId: string): Promise<string> {
    await mockDelay(200);
    const store = useAppStore.getState();
    return store.createIncidentFromEvidence(evidenceId);
  }

  /**
   * Deletes an evidence asset and updates audit history.
   */
  static async deleteEvidence(id: string): Promise<boolean> {
    await mockDelay(100);
    const store = useAppStore.getState();
    store.deleteEvidence(id);
    return true;
  }
}

export default EvidenceService;
