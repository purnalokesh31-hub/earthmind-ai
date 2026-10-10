// sync-manager.ts - Client-Side Synchronizer with API integration

import { EarthMindDB, OfflineCase, OfflineMedia } from './indexeddb';

export class SyncManager {
  private db: EarthMindDB;
  private apiBaseUrl: string;
  private isSyncing: boolean = false;

  constructor(db: EarthMindDB, apiBaseUrl: string = 'http://localhost:8000/api') {
    this.db = db;
    this.apiBaseUrl = apiBaseUrl;
  }

  /**
   * Run sync job on all pending items stored in IndexedDB.
   */
  async syncAllPending(onProgress?: (msg: string) => void): Promise<void> {
    if (this.isSyncing) return;
    
    // Check network availability
    if (!navigator.onLine) {
      if (onProgress) onProgress('Offline. Sync postponed.');
      return;
    }

    this.isSyncing = true;
    if (onProgress) onProgress('Starting offline records synchronization...');

    try {
      const pendingCases = await this.db.getPendingCases();
      
      for (const kase of pendingCases) {
        if (onProgress) onProgress(`Syncing: "${kase.title}"`);
        
        try {
          await this.syncSingleCase(kase);
          if (onProgress) onProgress(`Synced: "${kase.title}" successfully.`);
        } catch (err) {
          console.error(`Failed to sync case: ${kase.client_uuid}`, err);
          if (onProgress) onProgress(`Sync failed for "${kase.title}". Will retry.`);
          
          // Mark case as failed so user knows there's a problem
          kase.status = 'failed';
          await this.db.saveCase(kase);
        }
      }
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Performs the atomic 3-step sync protocol:
   * 1. Send metadata (POST /api/cases)
   * 2. Upload media binary files (POST /api/cases/{id}/media)
   * 3. Trigger server analytical pipeline (POST /api/cases/{id}/analyze)
   */
  private async syncSingleCase(kase: OfflineCase): Promise<void> {
    // 1. Metadata synchronization
    const metadataResponse = await fetch(`${this.apiBaseUrl}/cases/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_uuid: kase.client_uuid,
        domain: kase.domain,
        category: kase.category,
        title: kase.title,
        description: kase.description,
        latitude: kase.latitude,
        longitude: kase.longitude
      })
    });

    if (!metadataResponse.ok) {
      throw new Error(`Metadata sync failed with status ${metadataResponse.status}`);
    }

    const serverCase = await metadataResponse.json();
    const caseId = serverCase.case_id;

    // 2. Fetch local binary uploads
    const media = await this.db.getMedia(kase.client_uuid);
    if (media && (media.imageBlob || media.audioBlob)) {
      const formData = new FormData();
      
      if (media.imageBlob) {
        formData.append('image', media.imageBlob, 'evidence.jpg');
      }
      if (media.audioBlob) {
        formData.append('audio', media.audioBlob, 'voice.webm');
      }

      const mediaResponse = await fetch(`${this.apiBaseUrl}/cases/${caseId}/media`, {
        method: 'POST',
        body: formData
      });

      if (!mediaResponse.ok) {
        throw new Error(`Media upload failed with status ${mediaResponse.status}`);
      }
    }

    // 3. Trigger Vision/Scoring AI pipeline execution on the server
    const analyzeResponse = await fetch(`${this.apiBaseUrl}/cases/${caseId}/analyze`, {
      method: 'POST'
    });

    if (!analyzeResponse.ok) {
      throw new Error(`Inference trigger failed with status ${analyzeResponse.status}`);
    }

    // On completion, clean local offline records & media blobs
    await this.db.deleteCase(kase.client_uuid);
    await this.db.deleteMedia(kase.client_uuid);
  }
}
