// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Cache Provider Interface Contract
// ──────────────────────────────────────────────────────────────

export interface ICacheProvider {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<boolean>;
  has(key: string): Promise<boolean>;
  clear(): Promise<void>;
}
