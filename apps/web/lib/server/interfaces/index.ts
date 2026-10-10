// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — External Interfaces Layer Placeholder
// ──────────────────────────────────────────────────────────────

export interface IAiVisionEngineContract {
  runInference(imageUrl: string, modelTask: string): Promise<any>;
}

export interface IGisSpatialContract {
  calculateRiskRadius(lat: number, lng: number, hazardCategory: string): Promise<number>;
}

export interface ISatelliteStreamContract {
  fetchLatestTile(lat: number, lng: number): Promise<string>;
}
