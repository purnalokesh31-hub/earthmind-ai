// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Computer Vision Studio & Engine Verification Suite
// Tests 10-task inference coverage, coordinate normalization, simulation tagging,
// and department recommendation mappings.
// ──────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { computerVisionEngine, type VisionTaskType } from '../../lib/computer-vision-engine';

describe('Computer Vision Engine Studio & Telemetry Verification', () => {
  const allTenTasks: VisionTaskType[] = [
    'road_damage',
    'flood',
    'garbage',
    'illegal_dumping',
    'tree_damage',
    'crop_disease',
    'water_leakage',
    'electric_pole_damage',
    'fire',
    'building_damage',
  ];

  it('supports all 10 required domain tasks with unique task labels and non-empty detections', async () => {
    for (const task of allTenTasks) {
      const result = await computerVisionEngine.runInference(task);

      expect(result.taskType).toBe(task);
      expect(result.taskLabel).toBeDefined();
      expect(result.detectedObjects.length).toBeGreaterThan(0);
      expect(result.confidence).toBeGreaterThanOrEqual(50);
      expect(result.confidence).toBeLessThanOrEqual(100);
      expect(result.departmentRecommendation).toBeDefined();
      expect(result.damageCost).toContain('Rs');
      expect(result.boundingBoxes.length).toBeGreaterThan(0);
    }
  });

  it('correctly maps all 10 tasks to the appropriate municipal department recommendation', async () => {
    const expectedDepartments: Record<string, string> = {
      road_damage: 'Public Works Department',
      flood: 'Disaster Emergency Grid',
      garbage: 'Municipal Solid Waste Management',
      illegal_dumping: 'Municipal Enforcement & Sanitation',
      tree_damage: 'Urban Forestry & Parks Board',
      crop_disease: 'Agricultural Extension Office',
      water_leakage: 'Urban Hydro Division',
      electric_pole_damage: 'State Energy Grid Command',
      fire: 'Fire Services & Disaster Response',
      building_damage: 'Municipal Safety Board',
    };

    for (const [task, expectedDept] of Object.entries(expectedDepartments)) {
      const result = await computerVisionEngine.runInference(task as VisionTaskType);
      expect(result.departmentRecommendation).toBe(expectedDept);
    }
  });

  it('verifies bounding boxes adhere to UI canvas percentage boundaries (0 to 100%)', async () => {
    for (const task of allTenTasks) {
      const result = await computerVisionEngine.runInference(task);
      for (const box of result.boundingBoxes) {
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x).toBeLessThanOrEqual(100);
        expect(box.y).toBeGreaterThanOrEqual(0);
        expect(box.y).toBeLessThanOrEqual(100);
        expect(box.width).toBeGreaterThan(0);
        expect(box.width).toBeLessThanOrEqual(100);
        expect(box.height).toBeGreaterThan(0);
        expect(box.height).toBeLessThanOrEqual(100);
        expect(box.confidence).toBeGreaterThanOrEqual(0);
        expect(box.confidence).toBeLessThanOrEqual(100);
      }
    }
  });

  it('resolves legacy task aliases to canonical domain task IDs', async () => {
    const floodAlias = await computerVisionEngine.runInference('flood_detection' as VisionTaskType);
    expect(floodAlias.taskId).toBe('flood');

    const garbageAlias = await computerVisionEngine.runInference('garbage_detection' as VisionTaskType);
    expect(garbageAlias.taskId).toBe('garbage');

    const cropAlias = await computerVisionEngine.runInference('crop_health' as VisionTaskType);
    expect(cropAlias.taskId).toBe('crop_disease');

    const poleAlias = await computerVisionEngine.runInference('electric_pole' as VisionTaskType);
    expect(poleAlias.taskId).toBe('electric_pole_damage');

    const fireAlias = await computerVisionEngine.runInference('fire_detection' as VisionTaskType);
    expect(fireAlias.taskId).toBe('fire');
  });

  it('explicitly flags offline simulation results with isSimulated: true', async () => {
    // When offline mock is triggered
    const result = await computerVisionEngine.runInference('road_damage');
    // If backend was unreachable in test runner, it must be marked simulated
    if (result.analysisEngine === 'Mock-Simulation') {
      expect(result.isSimulated).toBe(true);
      expect(result.modelVersion).toContain('Offline Simulation');
    }
  });

  it('assigns explicit severity mapping based on risk thresholds', async () => {
    const result = await computerVisionEngine.runInference('fire');
    expect(['low', 'medium', 'high', 'critical']).toContain(result.severity);
    if ((result.riskScore ?? 0) >= 80) {
      expect(result.severity).toBe('critical');
    }
  });
});
