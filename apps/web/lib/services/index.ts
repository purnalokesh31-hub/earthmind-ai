// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Service Layer Index
// ──────────────────────────────────────────────────────────────
// Single entry point for all enterprise services.
//
// Usage in components:
//   import { IncidentService, AIService, EvidenceService, ComputerVisionService } from '../lib/services';
//
// Architecture:
//   User Action → UI Component → Service → Zustand Store → Derived UI
// ──────────────────────────────────────────────────────────────

export * from './incident.service';
export * from './ai.service';
export * from './notification.service';
export * from './resource.service';
export * from './analytics.service';
export * from './report.service';
export * from './storage.service';
export * from './evidence.service';
export * from './computer-vision.service';
export * from './ocr.service';
export * from './sensor.service';
