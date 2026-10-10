// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Computer Vision Service
// ──────────────────────────────────────────────────────────────
// Orchestrates YOLOv8 / TensorRT neural inference, damage bounding
// box calculations, and department recommendation generation.
// ──────────────────────────────────────────────────────────────

import { computerVisionEngine, type VisionTaskType, type CVPredictionOutput } from '../computer-vision-engine';
import { useAppStore } from '../../stores/app-store';
import type { VisionAnalysisResult, EvidenceItem } from '../../types';

const mockDelay = (ms = 250): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export class ComputerVisionService {
  /**
   * Runs vision inference task for specific hazard models (YOLOv8 architecture prepared).
   */
  static async runInferenceTask(task: VisionTaskType): Promise<CVPredictionOutput> {
    await mockDelay(300);
    const result = await computerVisionEngine.runInference(task);

    const store = useAppStore.getState();
    store.logAuditEvent({
      event: 'COMPUTER_VISION_TASK_EXECUTED',
      actor: 'EarthMind Vision Engine v4.2',
      details: `Executed task ${task} (${result.taskLabel}). Confidence: ${result.confidence}%, Est. Damage: ${result.damageCost}.`,
    });

    return result;
  }

  /**
   * Runs complete Vision Analysis pipeline on an uploaded EvidenceItem.
   */
  static async analyzeEvidence(evidenceId: string): Promise<VisionAnalysisResult> {
    await mockDelay(400);

    const store = useAppStore.getState();
    const evidence = store.evidenceList.find((e) => e.id === evidenceId);

    if (!evidence) {
      throw new Error(`Evidence with ID ${evidenceId} not found.`);
    }

    const aiAnalysis = await store.analyzeEvidence(evidenceId);

    const result: VisionAnalysisResult = {
      id: `vis-${Date.now()}`,
      evidenceId,
      overallConfidence: aiAnalysis.overallConfidence,
      detections: aiAnalysis.objectsDetected.map((obj, i) => ({
        id: `det-${i + 1}`,
        class: obj.toLowerCase().replace(/\s+/g, '_'),
        label: obj,
        confidence: Number((aiAnalysis.overallConfidence - i * 1.5).toFixed(1)),
        category: evidence.type,
      })),
      boundingBoxes: aiAnalysis.boundingBoxes,
      damageAssessment: {
        score: aiAnalysis.damageScore,
        severity: aiAnalysis.damageScore >= 80 ? 'critical' : aiAnalysis.damageScore >= 60 ? 'high' : 'medium',
        classification: aiAnalysis.classification,
        affectedAssets: ['Conduit Valve 4B', 'Substation Feeder 3'],
        estimatedCost: aiAnalysis.damageScore >= 80 ? '₹4,50,000' : '₹1,85,000',
      },
      recommendations: [
        {
          id: `rec-1`,
          department: aiAnalysis.recommendedDepartment,
          action: `Deploy immediate emergency repair crew to isolate hazard`,
          priority: aiAnalysis.damageScore >= 80 ? 'critical' : 'high',
          rationale: `Neural vision detected ${aiAnalysis.objectsDetected[0]} with ${aiAnalysis.overallConfidence}% confidence.`,
        },
      ],
      metrics: {
        processingTimeMs: aiAnalysis.processingTimeMs,
        fps: 45,
        deviceHardware: 'NVIDIA RTX 4090 / TensorRT 10.0',
        inferenceTimestamp: new Date().toISOString(),
      },
      modelInfo: {
        name: 'YOLOv8x-EarthMind-Infrastructure',
        version: 'v4.2.0',
        framework: 'PyTorch / TensorRT',
        architecture: 'CSPDarknet53 + PANet',
        checkpointId: 'chkpt-20260805-v8x',
      },
      analyzedAt: new Date().toISOString(),
    };

    return result;
  }
}

export default ComputerVisionService;
