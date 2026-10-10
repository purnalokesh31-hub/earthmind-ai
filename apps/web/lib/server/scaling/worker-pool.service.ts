// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Worker Pool Auto-Scaling & Concurrency Engine
// Manages dynamic worker process allocation based on queue depth
// ──────────────────────────────────────────────────────────────

import { logger } from '../logger';

export interface WorkerPoolMetrics {
  activeWorkers: number;
  minWorkers: number;
  maxWorkers: number;
  targetQueueRatio: number;
  currentQueueDepth: number;
  autoScalingState: 'STABLE' | 'SCALING_UP' | 'SCALING_DOWN';
}

export class WorkerPoolService {
  private activeWorkers = 4;
  private minWorkers = 2;
  private maxWorkers = 32;

  evaluateScaling(queueDepth: number): WorkerPoolMetrics {
    const desiredWorkers = Math.max(
      this.minWorkers,
      Math.min(this.maxWorkers, Math.ceil(queueDepth / 10))
    );

    let autoScalingState: WorkerPoolMetrics['autoScalingState'] = 'STABLE';

    if (desiredWorkers > this.activeWorkers) {
      autoScalingState = 'SCALING_UP';
      logger.info(`[WorkerPool] Scaling UP workers from ${this.activeWorkers} to ${desiredWorkers} (Queue depth: ${queueDepth})`);
      this.activeWorkers = desiredWorkers;
    } else if (desiredWorkers < this.activeWorkers) {
      autoScalingState = 'SCALING_DOWN';
      logger.info(`[WorkerPool] Scaling DOWN workers from ${this.activeWorkers} to ${desiredWorkers} (Queue depth: ${queueDepth})`);
      this.activeWorkers = desiredWorkers;
    }

    return {
      activeWorkers: this.activeWorkers,
      minWorkers: this.minWorkers,
      maxWorkers: this.maxWorkers,
      targetQueueRatio: 10,
      currentQueueDepth: queueDepth,
      autoScalingState,
    };
  }

  getActiveWorkerCount(): number {
    return this.activeWorkers;
  }
}

export const workerPoolService = new WorkerPoolService();
