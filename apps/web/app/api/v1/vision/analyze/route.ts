// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Vision Analyze Controller
// POST /api/v1/vision/analyze  — Authenticated Computer Vision Inference Engine
// ──────────────────────────────────────────────────────────────
export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { handleRequest } from '../../../../../lib/server/errors/error-handler';
import { authenticateOrPrototypeUser } from '../../../../../lib/server/auth/middleware.helpers';
import { NotFoundError, ForbiddenError, BadRequestError } from '../../../../../lib/server/errors/app-error';
import { validateBody } from '../../../../../lib/server/validation/validate';
import { VisionAnalysisSchema } from '../../../../../lib/server/validation/vision.schema';
import { successResponse } from '../../../../../lib/server/dto/shared.dto';
import container, { TOKENS } from '../../../../../lib/server/container';
import { IEvidenceRepository } from '../../../../../lib/server/repositories/evidence.repository';
import { IStorageProvider } from '../../../../../lib/server/storage/storage.interface';
import { aiInferenceService } from '../../../../../lib/server/ai/ai-inference.service';
import { aiConfig } from '../../../../../lib/server/config/ai.config';
import { logger } from '../../../../../lib/server/logger';

function getReadableEvidenceFileKey(storageUrl: string): string {
  const uploadsMarker = '/uploads/';
  const markerIndex = storageUrl.indexOf(uploadsMarker);

  if (markerIndex === -1) {
    throw new BadRequestError('Evidence storage location is not readable by the configured storage provider.');
  }

  const key = storageUrl.slice(markerIndex + uploadsMarker.length);
  if (!key) {
    throw new BadRequestError('Evidence storage location does not include a readable file key.');
  }

  return decodeURIComponent(key);
}

function resolveModelId(taskName: string): string {
  const taskToModel: Record<string, string> = {
    auto: 'yolov8-road-damage-v2',
    road_damage: 'yolov8-road-damage-v2',
    flood: 'yolov8-flood-detector-v1',
    garbage: 'yolov8-garbage-detection-v1',
    illegal_dumping: 'yolov8-illegal-dumping-v1',
    tree_damage: 'yolov8-tree-damage-v1',
    crop_disease: 'yolov8-crop-disease-v1',
    water_leakage: 'yolov8-water-leakage-v1',
    electric_pole_damage: 'yolov8-pole-wire-damage-v1',
    fire: 'yolov8-fire-smoke-v3',
    building_damage: 'yolov8-infrastructure-damage-v1',
  };

  return taskToModel[taskName] || 'yolov8-road-damage-v2';
}

export async function GET(req: Request): Promise<Response> {
  return handleRequest(req, async () =>
    new Response(
      JSON.stringify({
        success: false,
        error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST /api/v1/vision/analyze with { evidenceId, modelTask } body.' },
        timestamp: new Date().toISOString(),
      }),
      { status: 405, headers: { 'Content-Type': 'application/json', Allow: 'POST' } }
    )
  );
}

export async function POST(req: Request): Promise<Response> {
  return handleRequest(req, async () => {
    // ── Step 1: Authenticate User ──────────────────────────────
    const authUser = await authenticateOrPrototypeUser(req as unknown as NextRequest);

    // ── Step 2: Validate Request Payload ───────────────────────
    const validation = await validateBody(req, VisionAnalysisSchema);
    if (!validation.success) return validation.response;

    const { evidenceId, modelTask } = validation.data;

    // ── Step 3: Lookup Evidence Record ─────────────────────────
    const evidenceRepo = container.resolve<IEvidenceRepository>(TOKENS.EvidenceRepository);
    const evidence = await evidenceRepo.findById(evidenceId);
    if (!evidence) {
      throw new NotFoundError('Evidence', evidenceId);
    }

    // ── Step 4: Verify Authorization / Ownership ───────────────
    const isOwner = !evidence.uploadedByUserId || evidence.uploadedByUserId === authUser.userId;
    const isElevatedRole = ['SYSTEM_ADMIN', 'COMMANDER', 'SUPERVISOR'].includes(authUser.role);
    if (!isOwner && !isElevatedRole) {
      throw new ForbiddenError('You are not authorized to analyze evidence uploaded by another user.');
    }

    // ── Step 5: Verify File Type Compatibility ─────────────────
    const isImage =
      (evidence.fileType && (evidence.fileType === 'IMAGE' || evidence.fileType === 'image')) ||
      (evidence.mimeType && evidence.mimeType.startsWith('image/'));

    if (!isImage) {
      throw new BadRequestError(`Evidence '${evidenceId}' has type '${evidence.fileType || evidence.mimeType}'. Only image evidence can be analyzed by Computer Vision.`);
    }

    // ── Step 6: Verify AI Task Configuration ───────────────────
    const taskName = modelTask || 'road_damage';
    if (!aiConfig.supportedTasks.includes(taskName) && taskName !== 'road_damage' && taskName !== 'flood' && taskName !== 'yolov8-road-damage-v2') {
      return new Response(
        JSON.stringify({
          success: false,
          status: 'UNAVAILABLE',
          error: {
            code: 'AI_MODEL_UNAVAILABLE',
            message: `Vision AI model for task '${taskName}' is currently unavailable or unconfigured.`,
          },
          evidenceId,
          timestamp: new Date().toISOString(),
        }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ── Step 7: Load Original Evidence Bytes ───────────────────
    const storageProvider = container.resolve<IStorageProvider>(TOKENS.StorageProvider);
    const fileKey = getReadableEvidenceFileKey(evidence.storageUrl);
    let imageBuffer: Buffer;

    try {
      imageBuffer = await storageProvider.readFile(fileKey);
    } catch (err: any) {
      logger.warn(`[VisionAnalyzeAPI] Unable to load evidence bytes for '${evidenceId}': ${err.message}`);
      throw new BadRequestError(`Evidence '${evidenceId}' image bytes could not be loaded from storage.`);
    }

    if (imageBuffer.byteLength === 0) {
      throw new BadRequestError(`Evidence '${evidenceId}' image file is empty and cannot be analyzed.`);
    }

    // ── Step 8: Run Vision AI Inference ────────────────────────
    try {
      const inferenceResult = await aiInferenceService.runInference(
        evidenceId,
        imageBuffer,
        resolveModelId(taskName),
        taskName
      );

      // Update evidence status in repository
      await evidenceRepo.update(evidenceId, { status: 'ANALYZED' });

      logger.info(`[VisionAnalyzeAPI] Successfully analyzed evidence '${evidenceId}' for user '${authUser.userId}'`);

      return new Response(
        JSON.stringify(
          successResponse({
            evidenceId,
            taskLabel: taskName,
            modelVersion: aiConfig.defaultModelVersion,
            inferenceId: inferenceResult.inferenceId,
            inferenceMode: inferenceResult.inferenceMode,
            sourceFingerprint: inferenceResult.sourceFingerprint,
            detectedObjectsCount: inferenceResult.detectedObjectsCount,
            boundingBoxes: inferenceResult.boundingBoxes,
            riskAssessment: inferenceResult.riskAssessment,
            processingTimeMs: inferenceResult.processingTimeMs,
            analyzedAt: inferenceResult.executedAt,
          })
        ),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } catch (err: any) {
      logger.error(`[VisionAnalyzeAPI] AI inference failed for evidence '${evidenceId}': ${err.message}`);
      return new Response(
        JSON.stringify({
          success: false,
          status: 'UNAVAILABLE',
          error: {
            code: 'AI_INFERENCE_FAILED',
            message: 'Vision AI analysis engine is currently offline or unreachable.',
          },
          evidenceId,
          timestamp: new Date().toISOString(),
        }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }
  });
}
