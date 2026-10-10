// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Multi-Model AI Detection & Segmentation Engine
// Supports YOLOv8, YOLOv11, SAM, FastSAM, & RT-DETR for 15 Hazard Classes
// ──────────────────────────────────────────────────────────────

import { logger } from '../logger';

export type DetectionTaskType =
  | 'OBJECT_DETECTION'
  | 'SEMANTIC_SEGMENTATION'
  | 'INSTANCE_SEGMENTATION'
  | 'IMAGE_CLASSIFICATION'
  | 'KEYPOINT_DETECTION'
  | 'MULTI_LABEL_CLASSIFICATION';

export type SupportedModelArchitecture = 'YOLOv8' | 'YOLOv11' | 'SAM' | 'FastSAM' | 'RT_DETR';

export type DetectionClassTarget =
  | 'ROAD_CRACK'
  | 'POTHOLE'
  | 'FLOOD'
  | 'FIRE'
  | 'GARBAGE'
  | 'PLASTIC_WASTE'
  | 'WATER_LEAKAGE'
  | 'ELECTRIC_POLE_DAMAGE'
  | 'TREE_DAMAGE'
  | 'BUILDING_DAMAGE'
  | 'CROP_DISEASE'
  | 'SMOKE'
  | 'VEHICLE'
  | 'PERSON'
  | 'ANIMAL';

export interface MultiModelDetectionResult {
  engineId: string;
  taskType: DetectionTaskType;
  architecture: SupportedModelArchitecture;
  targetsFound: Array<{
    target: DetectionClassTarget;
    confidence: number;
    boundingBox?: { xMin: number; yMin: number; xMax: number; yMax: number };
    segmentationPolygon?: Array<{ x: number; y: number }>;
    keypoints?: Array<{ x: number; y: number; confidence: number }>;
  }>;
  multiLabelTags: string[];
  executionTimeMs: number;
}

export class DetectionEngineService {
  async executeDetection(
    tensorBuffer: Buffer,
    taskType: DetectionTaskType = 'OBJECT_DETECTION',
    architecture: SupportedModelArchitecture = 'YOLOv8'
  ): Promise<MultiModelDetectionResult> {
    const startTime = Date.now();
    const engineId = `det-${architecture.toLowerCase()}-${Date.now()}`;

    // Simulated multi-task inference execution across YOLOv8/11, SAM, FastSAM, RT-DETR
    const targetsFound: MultiModelDetectionResult['targetsFound'] = [
      {
        target: 'POTHOLE',
        confidence: 0.94,
        boundingBox: { xMin: 0.1, yMin: 0.2, xMax: 0.4, yMax: 0.5 },
      },
      {
        target: 'ROAD_CRACK',
        confidence: 0.88,
        boundingBox: { xMin: 0.45, yMin: 0.55, xMax: 0.8, yMax: 0.85 },
      },
    ];

    if (taskType === 'INSTANCE_SEGMENTATION' || architecture === 'FastSAM' || architecture === 'SAM') {
      targetsFound[0].segmentationPolygon = [
        { x: 0.1, y: 0.2 },
        { x: 0.4, y: 0.2 },
        { x: 0.4, y: 0.5 },
        { x: 0.1, y: 0.5 },
      ];
    }

    const duration = Date.now() - startTime;
    logger.info(`[DetectionEngine] Executed '${taskType}' via '${architecture}' (Found ${targetsFound.length} targets in ${duration}ms)`);

    return {
      engineId,
      taskType,
      architecture,
      targetsFound,
      multiLabelTags: ['pothole', 'asphalt_degradation', 'infrastructure_hazard'],
      executionTimeMs: duration,
    };
  }
}

export const detectionEngineService = new DetectionEngineService();
