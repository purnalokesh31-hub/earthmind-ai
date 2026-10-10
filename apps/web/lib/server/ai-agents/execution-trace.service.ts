// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — AI Agent Execution Trace Recorder
// ──────────────────────────────────────────────────────────────

import { AgentExecutionTraceDto } from '../domain/ai-agent.domain';

export class ExecutionTraceService {
  private traces: Map<string, AgentExecutionTraceDto[]> = new Map();

  recordStep(
    taskId: string,
    stepName: AgentExecutionTraceDto['stepName'],
    details: string,
    durationMs = 0
  ): AgentExecutionTraceDto {
    const trace: AgentExecutionTraceDto = {
      traceId: `trc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      taskId,
      stepName,
      timestamp: new Date().toISOString(),
      durationMs,
      details,
    };

    const list = this.traces.get(taskId) || [];
    list.push(trace);
    this.traces.set(taskId, list);

    return trace;
  }

  getTraceList(taskId: string): AgentExecutionTraceDto[] {
    return this.traces.get(taskId) || [];
  }
}

export const executionTraceService = new ExecutionTraceService();
