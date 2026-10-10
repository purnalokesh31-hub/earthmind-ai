// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Storage Service
// ──────────────────────────────────────────────────────────────
// Abstraction over browser storage. Provides a clean async
// interface for persisting data beyond Zustand's built‑in
// persistence (which only handles auditLogs).
//
// Current: localStorage / sessionStorage wrappers.
// Future: IndexedDB, cloud sync, encrypted storage.
// ──────────────────────────────────────────────────────────────

// ──────────────────────────────────────────────────────────────
// Configuration
// ──────────────────────────────────────────────────────────────

const STORAGE_PREFIX = 'earthmind_';

type StorageBackend = 'local' | 'session';

function getBackend(backend: StorageBackend): Storage {
  return backend === 'session' ? sessionStorage : localStorage;
}

// ──────────────────────────────────────────────────────────────
// Core Operations
// ──────────────────────────────────────────────────────────────

export async function setItem<T>(
  key: string,
  value: T,
  backend: StorageBackend = 'local',
): Promise<void> {
  try {
    const serialized = JSON.stringify(value);
    getBackend(backend).setItem(`${STORAGE_PREFIX}${key}`, serialized);
  } catch (error) {
    console.error(`[StorageService] Failed to set "${key}":`, error);
    throw new Error(`Storage write failed for key "${key}"`);
  }
}

export async function getItem<T>(
  key: string,
  backend: StorageBackend = 'local',
): Promise<T | null> {
  try {
    const raw = getBackend(backend).getItem(`${STORAGE_PREFIX}${key}`);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`[StorageService] Failed to get "${key}":`, error);
    return null;
  }
}

export async function removeItem(
  key: string,
  backend: StorageBackend = 'local',
): Promise<void> {
  try {
    getBackend(backend).removeItem(`${STORAGE_PREFIX}${key}`);
  } catch (error) {
    console.error(`[StorageService] Failed to remove "${key}":`, error);
  }
}

export async function hasItem(
  key: string,
  backend: StorageBackend = 'local',
): Promise<boolean> {
  return getBackend(backend).getItem(`${STORAGE_PREFIX}${key}`) !== null;
}

// ──────────────────────────────────────────────────────────────
// Batch Operations
// ──────────────────────────────────────────────────────────────

export async function setItems(
  entries: Array<{ key: string; value: any }>,
  backend: StorageBackend = 'local',
): Promise<void> {
  for (const entry of entries) {
    await setItem(entry.key, entry.value, backend);
  }
}

export async function getItems<T = any>(
  keys: string[],
  backend: StorageBackend = 'local',
): Promise<Record<string, T | null>> {
  const result: Record<string, T | null> = {};
  for (const key of keys) {
    result[key] = await getItem<T>(key, backend);
  }
  return result;
}

// ──────────────────────────────────────────────────────────────
// Namespace Operations
// ──────────────────────────────────────────────────────────────

export async function clearNamespace(
  namespace: string,
  backend: StorageBackend = 'local',
): Promise<number> {
  const storage = getBackend(backend);
  const prefix = `${STORAGE_PREFIX}${namespace}`;
  const keysToRemove: string[] = [];

  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key?.startsWith(prefix)) keysToRemove.push(key);
  }

  keysToRemove.forEach((key) => storage.removeItem(key));
  return keysToRemove.length;
}

export async function clearAll(backend: StorageBackend = 'local'): Promise<number> {
  const storage = getBackend(backend);
  const keysToRemove: string[] = [];

  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key?.startsWith(STORAGE_PREFIX)) keysToRemove.push(key);
  }

  keysToRemove.forEach((key) => storage.removeItem(key));
  return keysToRemove.length;
}

// ──────────────────────────────────────────────────────────────
// Storage Metrics
// ──────────────────────────────────────────────────────────────

export interface StorageMetrics {
  totalKeys: number;
  totalSizeBytes: number;
  keyBreakdown: Array<{ key: string; sizeBytes: number }>;
}

export async function getStorageMetrics(
  backend: StorageBackend = 'local',
): Promise<StorageMetrics> {
  const storage = getBackend(backend);
  let totalSize = 0;
  const breakdown: Array<{ key: string; sizeBytes: number }> = [];
  let count = 0;

  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key?.startsWith(STORAGE_PREFIX)) {
      const value = storage.getItem(key) || '';
      const size = new Blob([value]).size;
      totalSize += size;
      breakdown.push({ key: key.replace(STORAGE_PREFIX, ''), sizeBytes: size });
      count++;
    }
  }

  return {
    totalKeys: count,
    totalSizeBytes: totalSize,
    keyBreakdown: breakdown.sort((a, b) => b.sizeBytes - a.sizeBytes),
  };
}

// ──────────────────────────────────────────────────────────────
// User Preferences (convenience wrappers)
// ──────────────────────────────────────────────────────────────

export async function getUserPreferences(): Promise<Record<string, any>> {
  return (await getItem<Record<string, any>>('user_preferences')) ?? {};
}

export async function setUserPreference(key: string, value: any): Promise<void> {
  const prefs = await getUserPreferences();
  prefs[key] = value;
  await setItem('user_preferences', prefs);
}

export async function clearUserPreferences(): Promise<void> {
  await removeItem('user_preferences');
}

// ──────────────────────────────────────────────────────────────
// Export / Import (for debugging & data migration)
// ──────────────────────────────────────────────────────────────

export async function exportAllData(
  backend: StorageBackend = 'local',
): Promise<Record<string, any>> {
  const storage = getBackend(backend);
  const data: Record<string, any> = {};

  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key?.startsWith(STORAGE_PREFIX)) {
      try {
        data[key.replace(STORAGE_PREFIX, '')] = JSON.parse(storage.getItem(key) || 'null');
      } catch {
        data[key.replace(STORAGE_PREFIX, '')] = storage.getItem(key);
      }
    }
  }

  return data;
}

export async function importData(
  data: Record<string, any>,
  backend: StorageBackend = 'local',
): Promise<number> {
  let count = 0;
  for (const [key, value] of Object.entries(data)) {
    await setItem(key, value, backend);
    count++;
  }
  return count;
}
