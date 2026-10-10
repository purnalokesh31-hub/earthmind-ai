// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Enterprise Background Processing & Queue System
// Supports Memory / BullMQ queues, workers, retries, & Dead Letter Queue (DLQ)
// ──────────────────────────────────────────────────────────────

import { logger } from '../logger';

export interface BackgroundJob<T = unknown> {
  id: string;
  name: 'OCR_PROCESSING' | 'METADATA_EXTRACTION' | 'THUMBNAIL_GENERATION' | 'AI_PROCESSING' | 'SEARCH_INDEX';
  payload: T;
  priority?: number;
  attempts: number;
  maxAttempts: number;
  failedReason?: string;
  createdAt: Date;
}

export interface IJobQueue {
  enqueue<T>(jobName: BackgroundJob['name'], payload: T, priority?: number): Promise<BackgroundJob<T>>;
  process<T>(jobName: BackgroundJob['name'], handler: (job: BackgroundJob<T>) => Promise<void>): void;
  getDeadLetterQueue(): BackgroundJob[];
}

export class MemoryJobQueue implements IJobQueue {
  private queue: BackgroundJob[] = [];
  private deadLetterQueue: BackgroundJob[] = [];
  private handlers: Map<string, (job: BackgroundJob<any>) => Promise<void>> = new Map();

  async enqueue<T>(jobName: BackgroundJob['name'], payload: T, priority = 5): Promise<BackgroundJob<T>> {
    const job: BackgroundJob<T> = {
      id: `job-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: jobName,
      payload,
      priority,
      attempts: 0,
      maxAttempts: 3,
      createdAt: new Date(),
    };

    this.queue.push(job);
    this.queue.sort((a, b) => (b.priority || 5) - (a.priority || 5));
    logger.info(`[MemoryJobQueue] Enqueued job '${jobName}' (ID: ${job.id})`);

    setImmediate(() => this.triggerNext(jobName));
    return job;
  }

  process<T>(jobName: BackgroundJob['name'], handler: (job: BackgroundJob<T>) => Promise<void>): void {
    this.handlers.set(jobName, handler as any);
  }

  private async triggerNext(jobName: string): Promise<void> {
    const index = this.queue.findIndex((j) => j.name === jobName);
    if (index === -1) return;

    const job = this.queue.splice(index, 1)[0];
    const handler = this.handlers.get(jobName);
    if (!handler) return;

    while (job.attempts < job.maxAttempts) {
      try {
        job.attempts += 1;
        await handler(job);
        logger.info(`[MemoryJobQueue] Successfully executed job '${jobName}' (ID: ${job.id})`);
        return;
      } catch (error: any) {
        logger.error(`[MemoryJobQueue] Failed executing job '${jobName}' (Attempt ${job.attempts}/${job.maxAttempts}):`, error);
        if (job.attempts >= job.maxAttempts) {
          job.failedReason = error?.message || 'Max attempts reached';
          this.deadLetterQueue.push(job);
          logger.error(`[MemoryJobQueue] Moved job '${job.id}' to Dead Letter Queue (DLQ)`);
          return;
        }
      }
    }
  }

  getDeadLetterQueue(): BackgroundJob[] {
    return [...this.deadLetterQueue];
  }
}

export const jobQueue = new MemoryJobQueue();
