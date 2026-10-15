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
    return Boolean(aiConfig.engineUrl);
  }

  private normalizeExternalResult(evidenceId: string, modelId: string, payload: any, fallbackFingerprint: string, startTime: number): PredictionResult {
    const boxes: BoundingBoxResult[] = Array.isArray(payload.boundingBoxes)
      ? payload.boundingBoxes.map((box: any) => {
          const rawX = Number(box.xMin ?? box.x ?? 0);
          const rawY = Number(box.yMin ?? box.y ?? 0);
          const rawW = Number(box.width ?? (box.xMax !== undefined ? box.xMax - rawX : 0.2));
          const rawH = Number(box.height ?? (box.yMax !== undefined ? box.yMax - rawY : 0.2));

          const xMin = rawX > 1 ? rawX / 100 : rawX;
          const yMin = rawY > 1 ? rawY / 100 : rawY;
          const width = rawW > 1 ? rawW / 100 : rawW;
          const height = rawH > 1 ? rawH / 100 : rawH;

          const rawConf = Number(box.confidence ?? box.score ?? 0.75);
          const confidence = rawConf > 1 ? rawConf / 100 : rawConf;

          return {
            xMin,
            yMin,
            xMax: Math.min(1, xMin + width),
            yMax: Math.min(1, yMin + height),
            label: String(box.label || box.class || 'detected_hazard'),
            confidence,
            areaPercent: Number(box.areaPercent ?? Math.round(width * height * 100)),
          };
        })
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
    const timeoutMs = process.env.NODE_ENV === 'test' ? 2000 : aiConfig.inferenceTimeoutMs;
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const baseUrl = aiConfig.engineUrl.replace(/\/$/, '');
      const analyzeUrl = baseUrl.endsWith('/api')
        ? `${baseUrl}/v1/vision/analyze`
        : `${baseUrl}/api/v1/vision/analyze`;

      const res = await fetch(analyzeUrl, {
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
