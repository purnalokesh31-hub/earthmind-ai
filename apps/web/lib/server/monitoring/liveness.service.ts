// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Kubernetes Liveness Service
// Determines if the process is alive and responsive
// ──────────────────────────────────────────────────────────────

export interface LivenessCheckResult {
  isAlive: boolean;
  uptimeSeconds: number;
  memoryUsageMb: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
  };
  timestamp: string;
}

export class LivenessService {
  async checkLiveness(): Promise<LivenessCheckResult> {
    const memory = process.memoryUsage();
    const toMb = (bytes: number) => Math.round((bytes / 1024 / 1024) * 100) / 100;

    return {
      isAlive: true,
      uptimeSeconds: Math.floor(process.uptime()),
      memoryUsageMb: {
        rss: toMb(memory.rss),
        heapTotal: toMb(memory.heapTotal),
        heapUsed: toMb(memory.heapUsed),
      },
      timestamp: new Date().toISOString(),
    };
  }
}

export const livenessService = new LivenessService();
