// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 6.13 Enterprise AI Agent Platform Unit Suite
// ──────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { toolRegistry } from '../../lib/server/ai-agents/tool-registry';
import { knowledgeRetrievalService } from '../../lib/server/ai-agents/knowledge-retrieval.service';
import { contextBuilderService } from '../../lib/server/ai-agents/context-builder.service';
import { reasoningEngineService } from '../../lib/server/ai-agents/reasoning-engine.service';
import { agentSafetyService } from '../../lib/server/ai-agents/agent-safety.service';
import { agentOrchestratorService } from '../../lib/server/ai-agents/agent-orchestrator.service';
import { emergencyBriefingService } from '../../lib/server/ai-agents/emergency-briefing.service';

describe('Phase 6.13 — Enterprise AI Agent Orchestration & Knowledge Intelligence Suite', () => {
  // ── 1. Tool Registry ──
  it('should register and retrieve pluggable operational tools', () => {
    const tools = toolRegistry.listTools();
    expect(tools.length).toBeGreaterThanOrEqual(20);

    const evdSearch = toolRegistry.getTool('tool-evd-search');
    expect(evdSearch?.name).toBe('Evidence Search');
    expect(evdSearch?.requiredPermission).toBe('evidence:read');
  });

  // ── 2. Knowledge Retrieval & Context Building ──
  it('should retrieve citations from verified operational knowledge sources', async () => {
    const citations = await knowledgeRetrievalService.retrieveCitations('road subsidence');
    expect(citations.length).toBeGreaterThan(0);
    expect(citations[0].sourceType).toBe('INCIDENT');

    const context = await contextBuilderService.buildContext('flood risk', 'city-vja');
    expect(context.citations.length).toBeGreaterThan(0);
    expect(context.regionalRiskScore).toBeGreaterThan(0);
  });

  // ── 3. AI Reasoning Engine & Safety Guardrails ──
  it('should generate structured reasoning output and enforce human approval guardrails', async () => {
    const citations = await knowledgeRetrievalService.retrieveCitations('critical hazards');
    const reasoning = await reasoningEngineService.processReasoning('What requires attention?', citations);

    expect(reasoning.confidenceScore).toBeGreaterThan(90);
    expect(reasoning.requiresHumanApproval).toBe(true);

    const safety = agentSafetyService.validateSafety(reasoning);
    expect(reasoning.requiresHumanApproval).toBe(true);
  });

  // ── 4. Agent Orchestrator Task Execution ──
  it('should execute AI task workflow and transition state to WAITING_FOR_APPROVAL', async () => {
    const task = await agentOrchestratorService.executeTask(
      'Show highest-risk incidents in Vijayawada',
      'dutycommander@earthmind.gov',
      'INCIDENT_ANALYSIS'
    );

    expect(task.taskId).toBeDefined();
    expect(task.status).toBe('WAITING_FOR_APPROVAL');
    expect(task.reasoningOutput).toBeDefined();
    expect(task.retrievedKnowledgeCount).toBeGreaterThan(0);
  });

  // ── 5. Emergency Briefing Service ──
  it('should generate structured executive emergency briefing', async () => {
    const brief = await emergencyBriefingService.generateBriefing('CITY', 'city-vja');
    expect(brief.briefingId).toBeDefined();
    expect(brief.title).toContain('Executive Briefing');
    expect(brief.topPriorities.length).toBeGreaterThan(0);
  });
});
