// indexeddb.ts - IndexedDB Store configuration for EarthMind AI (PIOS)

export interface OfflineCase {
  client_uuid: string;
  domain: string;
  category: string;
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  captured_at: string;
  status: 'draft' | 'pending_sync' | 'synced' | 'failed' | 'dispatched';
  severity?: string;
  risk_score?: number;
  location_text?: string;
}

export interface OfflineMedia {
  client_uuid: string;
  imageBlob?: Blob;
  audioBlob?: Blob;
}

const DB_NAME = 'earthmind_offline_db';
const DB_VERSION = 1;

export class EarthMindDB {
  private db: IDBDatabase | null = null;

  init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event: any) => {
        const db = request.result;
        
        // Cases store (offline submissions)
        if (!db.objectStoreNames.contains('cases')) {
          db.createObjectStore('cases', { keyPath: 'client_uuid' });
        }
        
        // Media store (photo/audio payloads)
        if (!db.objectStoreNames.contains('media')) {
          db.createObjectStore('media', { keyPath: 'client_uuid' });
        }

        // Cached cases store (synced records)
        if (!db.objectStoreNames.contains('cached_cases')) {
          db.createObjectStore('cached_cases', { keyPath: 'case_id' });
        }
      };
    });
  }

  saveCase(caseData: OfflineCase): Promise<void> {
    return this.write('cases', caseData);
  }

  getPendingCases(): Promise<OfflineCase[]> {
    return this.readAll<OfflineCase>('cases');
  }

  deleteCase(client_uuid: string): Promise<void> {
    return this.delete('cases', client_uuid);
  }

  saveMedia(mediaData: OfflineMedia): Promise<void> {
    return this.write('media', mediaData);
  }

  getMedia(client_uuid: string): Promise<OfflineMedia | undefined> {
    return this.read<OfflineMedia>('media', client_uuid);
  }

  deleteMedia(client_uuid: string): Promise<void> {
    return this.delete('media', client_uuid);
  }

  saveCachedCases(cases: any[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cached_cases'], 'readwrite');
      const store = transaction.objectStore('cached_cases');
      
      // Clear legacy cache first
      store.clear();
      
      cases.forEach((c) => store.put(c));
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  getCachedCases(): Promise<any[]> {
    return this.readAll<any>('cached_cases');
  }

  // --- Helper Methods ---
  private write(storeName: string, data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private read<T>(storeName: string, key: string): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private readAll<T>(storeName: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  private delete(storeName: string, key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}
