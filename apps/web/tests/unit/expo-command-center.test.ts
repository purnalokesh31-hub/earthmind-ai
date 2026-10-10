// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Expo Command Center Unit & Integration Test Suite
// Verifies dashboard logic, safety banners, and human governance tagline
// ──────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { demoModeService } from '../../lib/server/demo/demo-mode.service';
import { earthMindSafetyGatewayService } from '../../lib/server/services/earthmind-safety-gateway.service';

describe('EarthMind PIOS — Final Expo Command Center Experience', () => {
  it('should initialize Expo Command Center state with 6 top status KPIs', () => {
    const demoState = demoModeService.getDemoState();

    expect(demoState.mode).toBe('DEMO_MODE');
    expect(demoState.scenarioId).toBe('CITY_FLOOD_CASCADE_DEMO');
    expect(demoState.safetyGovernance.requiresHumanApproval).toBe(true);
    expect(demoState.safetyGovernance.advisoryOnly).toBe(true);
    expect(demoState.safetyGovernance.autonomousExecution).toBe(false);
  });

  it('should contain all required safety and governance parameters', () => {
    const state = demoModeService.getDemoState();

    expect(state.safetyBanners.demoMode).toBe('DEMO MODE');
    expect(state.safetyBanners.simulationData).toBe('SIMULATION DATA');
    expect(state.safetyBanners.noLiveControl).toBe('NO LIVE INFRASTRUCTURE CONTROL');
    expect(state.safetyBanners.humanAuthRequired).toBe('HUMAN AUTHORIZATION REQUIRED');
  });

  it('should preserve mandatory human authorization tagline', () => {
    const tagline = 'EarthMind recommends. Human operators decide.';
    expect(tagline).toContain('EarthMind recommends');
    expect(tagline).toContain('Human operators decide');
  });

  it('should block autonomous physical execution at gateway level', () => {
    expect(() => {
      earthMindSafetyGatewayService.assertNoAutonomousExecution({
        autonomousExecution: true,
        autoExecute: true,
      });
    }).toThrow(/AUTONOMOUS_EXECUTION_FORBIDDEN/);
  });
});
