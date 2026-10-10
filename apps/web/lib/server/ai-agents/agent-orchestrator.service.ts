// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — AI Agent Orchestrator Service
// ──────────────────────────────────────────────────────────────

import { AgentTaskEntity, AgentTaskType, RecommendationDto } from '../domain/ai-agent.domain';
import { contextBuilderService } from './context-builder.service';
import { reasoningEngineService } from './reasoning-engine.service';
import { guardrailService } from './guardrail.service';
import { executionTraceService } from './execution-trace.service';
import { toolRegistry } from './tool-registry';

export class AgentOrchestratorService {
  private tasks: Map<string, AgentTaskEntity> = new Map();

  async executeTask(
    query: string,
    userEmail: string,
    taskType: AgentTaskType = 'CUSTOM_QUERY',
    scopeId = 'city-vja'
  ): Promise<AgentTaskEntity> {
    const taskId = `task-${Date.now()}`;
    const correlationId = `corr-${Date.now()}`;

    executionTraceService.recordStep(taskId, 'QUERY_RECEIVED', `Received query: "${query}"`);

    const task: AgentTaskEntity = {
      taskId,
      correlationId,
      taskType,
      requestingUser: userEmail,
      jurisdiction: scopeId,
      priority: 'HIGH',
      status: 'RETRIEVING',
      requestedQuery: query,
      retrievedKnowledgeCount: 0,
      toolInvocations: [],
      executionTrace: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.tasks.set(taskId, task);

    // 1. Invoke Tools & Build Context
    const toolInvocation = await toolRegistry.invokeTool('tool-sit-snap', { scopeId });
    task.toolInvocations.push(toolInvocation);
    executionTraceService.recordStep(taskId, 'TOOL_EXECUTED', `Invoked tool tool-sit-snap`);

    const context = await contextBuilderService.buildContext(query, scopeId);
    task.retrievedKnowledgeCount = context.citations.length;
    executionTraceService.recordStep(taskId, 'CONTEXT_RETRIEVED', `Retrieved ${context.citations.length} verified knowledge citations`);

    // 2. Process AI Reasoning
    task.status = 'REASONING';
    const reasoning = await reasoningEngineService.processReasoning(query, context.citations);
    task.reasoningOutput = reasoning;
    executionTraceService.recordStep(taskId, 'REASONING_COMPLETED', `Generated reasoning with confidence ${reasoning.confidenceScore}%`);

    // 3. Apply Safety Guardrails & Build Recommendation
    guardrailService.evaluateReasoning(reasoning);

    const rec: RecommendationDto = {
      recommendationId: `rec-${Date.now()}`,
      type: 'INSPECT_ZONE',
      title: reasoning.recommendedOption,
      description: reasoning.expectedImpact,
      targetDepartment: 'Public Works Department',
      jurisdiction: scopeId,
      reasoning,
      requiresHumanApproval: true,
      approvalStatus: 'PENDING',
    };

    task.recommendation = rec;
    task.status = 'WAITING_FOR_APPROVAL';
    executionTraceService.recordStep(taskId, 'RECOMMENDATION_GENERATED', `Created recommendation rec-${Date.now()} requiring human approval`);

    task.executionTrace = executionTraceService.getTraceList(taskId);
    task.updatedAt = new Date();

    return task;
  }

  async getTask(taskId: string): Promise<AgentTaskEntity | undefined> {
    return this.tasks.get(taskId);
  }

  async listTasks(): Promise<AgentTaskEntity[]> {
    return Array.from(this.tasks.values());
  }
}

export const agentOrchestratorService = new AgentOrchestratorService();
