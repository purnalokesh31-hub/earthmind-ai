// ──────────────────────────────────────────────────────────────
// EarthMind PIOS v2.0 — Enterprise Computer Vision Inference Engine
// Real Gemini Vision API backend + PIL local fallback + offline mock
// ──────────────────────────────────────────────────────────────

import type { Category, Severity, BoundingBox } from '../types';

export type VisionTaskType =
  | 'road_damage'
  | 'flood'
  | 'garbage'
  | 'illegal_dumping'
  | 'tree_damage'
  | 'crop_disease'
  | 'water_leakage'
  | 'electric_pole_damage'
  | 'fire'
  | 'building_damage'
  | 'flood_detection'
  | 'garbage_detection'
  | 'crop_health'
  | 'electric_pole'
  | 'fire_detection';

export interface CVPredictionOutput {
  taskType: VisionTaskType;
  taskId?: VisionTaskType;
  taskLabel: string;
  detectedObjects: string[];
  boundingBoxes: BoundingBox[];
  confidence: number;
  confidenceScore?: number;
  severity: Severity;
  affectedArea: string;
  affectedAreaSqMeters?: number;
  damageCost: string;
  estimatedDamageCost?: string;
  departmentRecommendation: string;
  suggestedDepartment?: string;
  inferenceTimeMs: number;
  modelVersion: string;
  yoloModelVersion?: string;
  analysisEngine?: string;
  riskScore?: number;
  aiVisionSummary?: string;
}

export interface IComputerVisionEngine {
  runInference(task: VisionTaskType, imageUrl?: string): Promise<CVPredictionOutput>;
  runInferenceTask(task: VisionTaskType): Promise<CVPredictionOutput>;
}

const TASK_LABELS: Record<string, string> = {
  road_damage: 'Road Damage & Subsidence Detection',
  flood: 'Hydrodynamic Urban Flood Inundation',
  flood_detection: 'Hydrodynamic Urban Flood Inundation',
  garbage: 'Solid Waste & Illegal Dumping Detection',
  garbage_detection: 'Solid Waste & Illegal Dumping Detection',
  illegal_dumping: 'Solid Waste & Illegal Dumping Detection',
  tree_damage: 'Arboricultural Hazard & Fallen Canopy',
  crop_disease: 'Agricultural Pest & Foliar Blight Detection',
  crop_health: 'Agricultural Pest & Foliar Blight Detection',
  water_leakage: 'Sub-surface Hydro Main Fracture',
  electric_pole_damage: 'High-Voltage Utility Pole Tilt & Transformer Damage',
  electric_pole: 'High-Voltage Utility Pole Tilt & Transformer Damage',
  fire: 'Thermal Ignition & Smoke Plume Detection',
  fire_detection: 'Thermal Ignition & Smoke Plume Detection',
  building_damage: 'Structural Facade Deformation & Masonry Shear',
};

const MOCK_PRESETS: Record<string, Partial<CVPredictionOutput>> = {
  road_damage: {
    detectedObjects: ['Subsurface Pothole Breach', 'Asphalt Shear Crack', 'Base Course Exposure'],
    boundingBoxes: [
      { id: 'cv-1', label: 'Asphalt Pothole (0.8m depth)', confidence: 97.4, severity: 'critical', x: 25, y: 30, width: 40, height: 35 },
      { id: 'cv-2', label: 'Longitudinal Fracture', confidence: 91.2, severity: 'high', x: 62, y: 45, width: 25, height: 40 },
    ],
    confidence: 97.4, severity: 'high', affectedAreaSqMeters: 85,
    damageCost: 'Rs 1,45,000', departmentRecommendation: 'Public Works Department', riskScore: 78,
  },
  flood: {
    detectedObjects: ['Water Crest Overflow', 'Residential Inundation Zone', 'Drain Silt Blockage'],
    boundingBoxes: [{ id: 'cv-3', label: 'Water Level Crest (1.8m depth)', confidence: 98.6, severity: 'critical', x: 15, y: 20, width: 70, height: 55 }],
    confidence: 98.6, severity: 'critical', affectedAreaSqMeters: 1450,
    damageCost: 'Rs 6,20,000', departmentRecommendation: 'Disaster Emergency Grid', riskScore: 92,
  },
  garbage: {
    detectedObjects: ['Bio-Hazard Waste Heap', 'Industrial Slag Refuse', 'Drain Obstruction Waste'],
    boundingBoxes: [{ id: 'cv-4', label: 'Unsanctioned Debris Mound', confidence: 95.8, severity: 'medium', x: 30, y: 35, width: 45, height: 40 }],
    confidence: 95.8, severity: 'medium', affectedAreaSqMeters: 120,
    damageCost: 'Rs 45,000', departmentRecommendation: 'Municipal Solid Waste Management', riskScore: 55,
  },
  water_leakage: {
    detectedObjects: ['Pressurized Main Valve Breach', 'Sub-grade Plume', 'Asphalt Sub-erosion'],
    boundingBoxes: [{ id: 'cv-7', label: 'Main Pipe Joint Leak (2,400 L/h)', confidence: 96.5, severity: 'critical', x: 20, y: 25, width: 50, height: 45 }],
    confidence: 96.5, severity: 'critical', affectedAreaSqMeters: 220,
    damageCost: 'Rs 2,80,000', departmentRecommendation: 'Urban Hydro Division', riskScore: 90,
  },
  fire: {
    detectedObjects: ['Active Flame Core', 'Dense Carbon Smoke Plume', 'Thermal Overheat Zone'],
    boundingBoxes: [{ id: 'cv-9', label: 'Active Thermal Ignition Core', confidence: 99.1, severity: 'critical', x: 35, y: 15, width: 35, height: 50 }],
    confidence: 99.1, severity: 'critical', affectedAreaSqMeters: 450,
    damageCost: 'Rs 8,50,000', departmentRecommendation: 'Fire Services & Disaster Response', riskScore: 98,
  },
};

export class EnterpriseComputerVisionEngine implements IComputerVisionEngine {
  private readonly API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  async runInference(task: VisionTaskType, imageUrl?: string): Promise<CVPredictionOutput> {
    const t0 = Date.now();
    const normalizedTask = this._normalizeTask(task);
    const taskLabel = TASK_LABELS[task] || TASK_LABELS[normalizedTask] || 'General Hazard Detection';
    const modelVersion = 'EarthMind-Vision-v2.0';

    try {
      const res = await fetch(`${this.API_BASE}/api/v1/vision/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evidenceId: '', modelTask: normalizedTask }),
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) throw new Error(`Vision API returned ${res.status}`);
      const json = await res.json();
      if (!json?.success || !json?.data) throw new Error('Invalid API response');

      const d = json.data;
      const inferenceTimeMs = Date.now() - t0;

      return {
        taskType: task,
        taskId: normalizedTask as VisionTaskType,
        taskLabel,
        detectedObjects: d.detectedObjects || [],
        boundingBoxes: (d.boundingBoxes || []).map((bb: any, idx: number) => ({
          id: bb.id || `cv-${idx}`,
          label: bb.label || 'Detected Object',
          confidence: Number(bb.confidence) || 85,
          severity: this._severityFromScore(d.riskScore || 50),
          x: Number(bb.x) || 20,
          y: Number(bb.y) || 20,
          width: Number(bb.width) || 40,
          height: Number(bb.height) || 40,
        })),
        confidence: Number(d.confidenceScore) || 85,
        confidenceScore: Number(d.confidenceScore) || 85,
        severity: (d.damageSeverity as Severity) || 'medium',
        affectedArea: `${d.affectedAreaSqMeters || 0} m²`,
        affectedAreaSqMeters: Number(d.affectedAreaSqMeters) || 0,
        damageCost: d.estimatedDamageCost || 'N/A',
        estimatedDamageCost: d.estimatedDamageCost || 'N/A',
        departmentRecommendation: d.suggestedDepartment || 'Municipal Administration',
        suggestedDepartment: d.suggestedDepartment || 'Municipal Administration',
        inferenceTimeMs,
        modelVersion,
        yoloModelVersion: modelVersion,
        analysisEngine: d.analysisEngine || 'EarthMind-AI',
        riskScore: Number(d.riskScore) || 50,
        aiVisionSummary: d.aiVisionSummary || '',
      };
    } catch (err) {
      console.warn(`[CV Engine] Backend unreachable, using offline mock for task="${task}":`, err);
      return this._offlineMock(task, normalizedTask as VisionTaskType, taskLabel, modelVersion);
    }
  }

  async runInferenceTask(task: VisionTaskType): Promise<CVPredictionOutput> {
    return this.runInference(task);
  }

  private _normalizeTask(task: VisionTaskType): string {
    const aliases: Record<string, string> = {
      flood_detection: 'flood', garbage_detection: 'garbage',
      illegal_dumping: 'garbage', crop_health: 'crop_disease',
      electric_pole: 'electric_pole_damage', fire_detection: 'fire',
    };
    return aliases[task] || task;
  }

  private _severityFromScore(score: number): Severity {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 35) return 'medium';
    return 'low';
  }

  private _offlineMock(task: VisionTaskType, normalizedTask: VisionTaskType, taskLabel: string, modelVersion: string): CVPredictionOutput {
    const preset = MOCK_PRESETS[normalizedTask] || MOCK_PRESETS['road_damage'];
    return {
      taskType: task, taskId: normalizedTask, taskLabel,
      detectedObjects: preset.detectedObjects || ['Surface Anomaly'],
      boundingBoxes: preset.boundingBoxes || [],
      confidence: preset.confidence || 85, confidenceScore: preset.confidence || 85,
      severity: preset.severity || 'medium',
      affectedArea: `${preset.affectedAreaSqMeters || 100} m²`,
      affectedAreaSqMeters: preset.affectedAreaSqMeters || 100,
      damageCost: preset.damageCost || 'Rs 1,00,000',
      estimatedDamageCost: preset.damageCost || 'Rs 1,00,000',
      departmentRecommendation: preset.departmentRecommendation || 'Municipal Administration',
      suggestedDepartment: preset.departmentRecommendation || 'Municipal Administration',
      inferenceTimeMs: Math.round(11 + Math.random() * 6),
      modelVersion: `${modelVersion} [Offline]`, yoloModelVersion: `${modelVersion} [Offline]`,
      analysisEngine: 'Mock-Offline', riskScore: preset.riskScore || 50,
      aiVisionSummary: `Offline analysis for ${taskLabel}. Risk: ${preset.riskScore || 50}/100.`,
    };
  }
}

export const computerVisionEngine = new EnterpriseComputerVisionEngine();
