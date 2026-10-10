// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Vision Analysis DTOs
// ──────────────────────────────────────────────────────────────

// ── Requests ──────────────────────────────────────────────────

export interface VisionAnalysisRequestDto {
  evidenceId: string;
  modelTask: string;
  priority?: 'normal' | 'high' | 'critical';
}

// ── Sub-Objects ────────────────────────────────────────────────

export interface BoundingBoxDto {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DetectedObjectDto {
  label: string;
  confidence: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  boundingBox?: BoundingBoxDto;
  damageScore?: number;
}

export interface PipelineStageDto {
  stage: string;
  status: 'pending' | 'processing' | 'complete' | 'error';
  durationMs?: number;
  message?: string;
}

// ── Responses ─────────────────────────────────────────────────

export interface VisionAnalysisResponseDto {
  evidenceId: string;
  taskLabel: string;
  modelVersion: string;
  confidence: number;            // 0–100
  damageScore: number;           // 0–100
  riskScore: number;             // 0–100
  detectedObjects: DetectedObjectDto[];
  ocrText?: string;
  aiSummary?: string;
  recommendedCategory?: string;
  recommendedSeverity?: string;
  recommendedDepartment?: string;
  processingPipeline: PipelineStageDto[];
  totalInferenceMs: number;
  analyzedAt: string;
}

export interface VisionAnalysisListResponseDto {
  analyses: VisionAnalysisResponseDto[];
  total: number;
}
