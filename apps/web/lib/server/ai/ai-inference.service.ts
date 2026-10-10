// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — AI Vision Inference Service
// ──────────────────────────────────────────────────────────────

import { ModelRegistry, modelRegistry as defaultRegistry } from './model-registry';
import { BoundingBoxResult, InferencePipeline, inferencePipeline as defaultPipeline, PredictionResult, RiskScoreResult } from './inference-pipeline';
import { aiConfig } from '../config/ai.config';
import { logger } from '../logger';

export class AIInferenceService {
  constructor(
    private readonly registry: ModelRegistry = defaultRegistry,
    private readonly pipeline: InferencePipeline = defaultPipeline
  ) {}

  private shouldUseExternalEngine(): boolean {
    return Boolean(aiConfig.engineUrl && !aiConfig.engineUrl.includes('localhost') && !aiConfig.engineUrl.includes('127.0.0.1'));
  }

  private normalizeExternalResult(evidenceId: string, modelId: string, payload: any, fallbackFingerprint: string, startTime: number): PredictionResult {
    const boxes: BoundingBoxResult[] = Array.isArray(payload.boundingBoxes)
      ? payload.boundingBoxes.map((box: any) => ({
          xMin: Number(box.xMin ?? box.x ?? 0),
          yMin: Number(box.yMin ?? box.y ?? 0),
          xMax: Number(box.xMax ?? ((box.x ?? 0) + (box.width ?? 0.2))),
          yMax: Number(box.yMax ?? ((box.y ?? 0) + (box.height ?? 0.2))),
          label: String(box.label || box.class || 'detected_hazard'),
          confidence: Number(box.confidence ?? box.score ?? 0.75),
          areaPercent: Number(box.areaPercent ?? 8),
        }))
      : [];

    const risk: RiskScoreResult = {
      riskScore: Number(payload.riskAssessment?.riskScore ?? payload.riskScore ?? 50),
      severityCategory: payload.riskAssessment?.severityCategory || payload.severityCategory || 'MEDIUM',
      priorityLevel: payload.riskAssessment?.priorityLevel || payload.priorityLevel || 'P3',
      recommendedDepartment: payload.riskAssessment?.recommendedDepartment || payload.recommendedDepartment || 'Emergency Operations Center',
      estimatedCostInr: Number(payload.riskAssessment?.estimatedCostInr ?? payload.estimatedCostInr ?? 0),
    };

    return {
      inferenceId: String(payload.inferenceId || `ext-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`),
      modelId: String(payload.modelId || modelId),
      evidenceId,
      inferenceMode: 'EXTERNAL_AI',
      sourceFingerprint: String(payload.sourceFingerprint || fallbackFingerprint),
      detectedObjectsCount: Number(payload.detectedObjectsCount ?? boxes.length),
      boundingBoxes: boxes,
      riskAssessment: risk,
      processingTimeMs: Number(payload.processingTimeMs ?? Date.now() - startTime),
      executedAt: payload.executedAt ? new Date(payload.executedAt) : new Date(),
    };
  }

  private async runExternalInference(evidenceId: string, imageBuffer: Buffer, modelTask: string, modelId: string, fingerprint: string, startTime: number): Promise<PredictionResult | null> {
    if (!this.shouldUseExternalEngine()) return null;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), aiConfig.inferenceTimeoutMs);

    try {
      const res = await fetch(`${aiConfig.engineUrl.replace(/\/$/, '')}/v1/vision/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          evidenceId,
          modelTask,
          imageBase64: imageBuffer.toString('base64'),
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json) {
        throw new Error(json?.error?.message || json?.message || `External AI returned HTTP ${res.status}`);
      }
      return this.normalizeExternalResult(evidenceId, modelId, json.data || json, fingerprint, startTime);
    } catch (err: any) {
      logger.warn(`[AIInferenceService] External AI unavailable; using local prototype fallback. Reason: ${err.message}`);
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }

  async runInference(evidenceId: string, imageBuffer: Buffer, modelId = 'yolov8-road-damage-v2', modelTask = 'road_damage'): Promise<PredictionResult> {
    const startTime = Date.now();
    const model = this.registry.getModel(modelId);

    if (!model) {
      throw new Error(`AI Model '${modelId}' not found in registry`);
    }

    const preprocessedBuffer = this.pipeline.preprocess(imageBuffer, model);
    const sourceFingerprint = this.pipeline.getSourceFingerprint(preprocessedBuffer).slice(0, 12);
    const externalResult = await this.runExternalInference(evidenceId, preprocessedBuffer, modelTask, model.modelId, sourceFingerprint, startTime);
    if (externalResult) {
      logger.info(`[AIInferenceService] Completed external vision inference '${externalResult.inferenceId}' for evidence '${evidenceId}' (Risk Score: ${externalResult.riskAssessment.riskScore})`);
      return externalResult;
    }

    const boundingBoxes = this.pipeline.detectObjects(preprocessedBuffer, model);
    const riskAssessment = this.pipeline.calculateRisk(boundingBoxes, model.domain);

    const result: PredictionResult = {
      inferenceId: `inf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      modelId: model.modelId,
      evidenceId,
      inferenceMode: 'LOCAL_PROTOTYPE',
      sourceFingerprint,
      detectedObjectsCount: boundingBoxes.length,
      boundingBoxes,
      riskAssessment,
      processingTimeMs: Date.now() - startTime,
      executedAt: new Date(),
    };

    logger.info(`[AIInferenceService] Completed vision inference '${result.inferenceId}' for evidence '${evidenceId}' (Risk Score: ${riskAssessment.riskScore})`);
    return result;
  }
}

export const aiInferenceService = new AIInferenceService();
