// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Centralized AI Vision Engine Configuration
// ──────────────────────────────────────────────────────────────

import envConfig from './env.config';

export interface AiConfig {
  engineUrl: string;
  inferenceTimeoutMs: number;
  minConfidenceThreshold: number;
  defaultModelVersion: string;
  supportedTasks: string[];
}

export const aiConfig: AiConfig = {
  engineUrl: envConfig.AI_ENGINE_URL,
  inferenceTimeoutMs: envConfig.AI_INFERENCE_TIMEOUT_MS,
  minConfidenceThreshold: envConfig.AI_MIN_CONFIDENCE_THRESHOLD,
  defaultModelVersion: 'YOLOv8x-v4.2-TensorRT',
  supportedTasks: [
    'auto',
    'road_damage',
    'flood',
    'garbage',
    'illegal_dumping',
    'tree_damage',
    'crop_disease',
    'water_leakage',
    'electric_pole_damage',
    'fire',
    'building_damage',
  ],
};

export default aiConfig;
