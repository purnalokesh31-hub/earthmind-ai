// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — AI Model Registry & Computer Vision Engine Registry
// Supports YOLOv8, YOLOv11, TensorRT, ONNX Runtime, PyTorch, & OpenVINO
// ──────────────────────────────────────────────────────────────

export type ModelFramework = 'YOLOv8' | 'YOLOv11' | 'TensorRT' | 'ONNX_Runtime' | 'PyTorch' | 'OpenVINO';

export type IncidentCategoryDomain =
  | 'ROAD_DAMAGE'
  | 'FLOOD_DETECTION'
  | 'GARBAGE_DETECTION'
  | 'FIRE_DETECTION'
  | 'CROP_DISEASE'
  | 'ILLEGAL_DUMPING'
  | 'BUILDING_DAMAGE'
  | 'ELECTRIC_POLE_DAMAGE'
  | 'WATER_LEAKAGE'
  | 'DISASTER_ASSESSMENT';

export interface ModelMetadata {
  modelId: string;
  name: string;
  version: string;
  domain: IncidentCategoryDomain;
  framework: ModelFramework;
  confidenceThreshold: number;
  classes: string[];
  inputDimensions: { width: number; height: number; channels: number };
  executionDevice: 'GPU_CUDA' | 'TENSOR_RT' | 'NPU' | 'CPU';
}

export class ModelRegistry {
  private models: Map<string, ModelMetadata> = new Map();

  constructor() {
    this.registerDefaultModels();
  }

  private registerDefaultModels(): void {
    const defaultModels: ModelMetadata[] = [
      {
        modelId: 'yolov8-road-damage-v2',
        name: 'EarthMind YOLOv8 Road Damage Inspector',
        version: '8.2.0',
        domain: 'ROAD_DAMAGE',
        framework: 'YOLOv8',
        confidenceThreshold: 0.65,
        classes: ['pothole', 'asphalt_crack', 'road_subsidence', 'rutting'],
        inputDimensions: { width: 640, height: 640, channels: 3 },
        executionDevice: 'GPU_CUDA',
      },
      {
        modelId: 'yolov8-flood-detector-v1',
        name: 'EarthMind Flood & Waterlogging Vision Engine',
        version: '8.1.0',
        domain: 'FLOOD_DETECTION',
        framework: 'TensorRT',
        confidenceThreshold: 0.70,
        classes: ['submerged_road', 'waterlogging', 'rising_river', 'drainage_overflow'],
        inputDimensions: { width: 640, height: 640, channels: 3 },
        executionDevice: 'TENSOR_RT',
      },
      {
        modelId: 'yolov8-garbage-detection-v1',
        name: 'EarthMind Waste & Sanitation Vision Inspector',
        version: '8.0.4',
        domain: 'GARBAGE_DETECTION',
        framework: 'ONNX_Runtime',
        confidenceThreshold: 0.60,
        classes: ['overflowing_bin', 'unauthorized_waste', 'plastic_debris', 'litter_pile'],
        inputDimensions: { width: 640, height: 640, channels: 3 },
        executionDevice: 'GPU_CUDA',
      },
      {
        modelId: 'yolov8-fire-smoke-v3',
        name: 'EarthMind Wildfire & Smoke Plume Detector',
        version: '8.3.1',
        domain: 'FIRE_DETECTION',
        framework: 'PyTorch',
        confidenceThreshold: 0.75,
        classes: ['active_fire', 'smoke_plume', 'thermal_anomaly', 'wildfire_front'],
        inputDimensions: { width: 640, height: 640, channels: 3 },
        executionDevice: 'GPU_CUDA',
      },
      {
        modelId: 'yolov8-infrastructure-damage-v1',
        name: 'EarthMind Infrastructure & Utility Damage Detector',
        version: '8.2.0',
        domain: 'BUILDING_DAMAGE',
        framework: 'OpenVINO',
        confidenceThreshold: 0.65,
        classes: ['wall_crack', 'roof_collapse', 'tilted_electric_pole', 'water_main_leak'],
        inputDimensions: { width: 640, height: 640, channels: 3 },
        executionDevice: 'CPU',
      },
      {
        modelId: 'yolov8-tree-damage-v1',
        name: 'EarthMind Tree & Vegetation Hazard Detector',
        version: '8.0.1',
        domain: 'DISASTER_ASSESSMENT',
        framework: 'YOLOv8',
        confidenceThreshold: 0.62,
        classes: ['fallen_tree', 'hanging_branch', 'blocked_road', 'vegetation_debris'],
        inputDimensions: { width: 640, height: 640, channels: 3 },
        executionDevice: 'CPU',
      },
      {
        modelId: 'yolov8-crop-disease-v1',
        name: 'EarthMind Crop Disease Visual Inspector',
        version: '8.0.1',
        domain: 'CROP_DISEASE',
        framework: 'YOLOv8',
        confidenceThreshold: 0.60,
        classes: ['leaf_blight', 'rust_spot', 'mildew_patch', 'pest_damage'],
        inputDimensions: { width: 640, height: 640, channels: 3 },
        executionDevice: 'CPU',
      },
      {
        modelId: 'yolov8-illegal-dumping-v1',
        name: 'EarthMind Illegal Dumping Detector',
        version: '8.0.1',
        domain: 'ILLEGAL_DUMPING',
        framework: 'YOLOv8',
        confidenceThreshold: 0.60,
        classes: ['construction_debris', 'dumped_waste', 'hazardous_container', 'blocked_drain'],
        inputDimensions: { width: 640, height: 640, channels: 3 },
        executionDevice: 'CPU',
      },
      {
        modelId: 'yolov8-pole-wire-damage-v1',
        name: 'EarthMind Electric Pole & Wire Damage Detector',
        version: '8.0.1',
        domain: 'ELECTRIC_POLE_DAMAGE',
        framework: 'YOLOv8',
        confidenceThreshold: 0.62,
        classes: ['tilted_pole', 'broken_wire', 'spark_risk', 'transformer_damage'],
        inputDimensions: { width: 640, height: 640, channels: 3 },
        executionDevice: 'CPU',
      },
      {
        modelId: 'yolov8-water-leakage-v1',
        name: 'EarthMind Water Leakage Detector',
        version: '8.0.1',
        domain: 'WATER_LEAKAGE',
        framework: 'YOLOv8',
        confidenceThreshold: 0.62,
        classes: ['pipe_leak', 'surface_water_flow', 'sinkhole_risk', 'valve_failure'],
        inputDimensions: { width: 640, height: 640, channels: 3 },
        executionDevice: 'CPU',
      },
    ];

    defaultModels.forEach((m) => this.models.set(m.modelId, m));
  }

  registerModel(model: ModelMetadata): void {
    this.models.set(model.modelId, model);
  }

  getModel(modelId: string): ModelMetadata | null {
    return this.models.get(modelId) || null;
  }

  findModelsByDomain(domain: IncidentCategoryDomain): ModelMetadata[] {
    return Array.from(this.models.values()).filter((m) => m.domain === domain);
  }

  listModels(): ModelMetadata[] {
    return Array.from(this.models.values());
  }
}

export const modelRegistry = new ModelRegistry();
