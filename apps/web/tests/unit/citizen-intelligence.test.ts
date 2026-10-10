// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 6.12 Citizen Intelligence Unit Suite
// ──────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { memoryCitizenReportRepository, memoryCitizenFeedbackRepository } from '../../lib/server/repositories/citizen-report.repository';
import { citizenReportClassificationService } from '../../lib/server/services/citizen-report-classification.service';
import { duplicateReportDetectionService } from '../../lib/server/services/duplicate-report-detection.service';
import { citizenFeedbackService } from '../../lib/server/services/citizen-feedback.service';

describe('Phase 6.12 — Enterprise Citizen Intelligence & Public Engagement Suite', () => {
  // ── 1. AI Classification ──
  it('should provide advisory AI classification for citizen reports', async () => {
    const res = await citizenReportClassificationService.classifyReport(
      'Deep Pothole near School',
      'Two-wheelers slipping during heavy rain'
    );

    expect(res.suggestedCategory).toBe('ROAD_DAMAGE');
    expect(res.suggestedDepartment).toBe('Public Works Department');
    expect(res.confidence).toBeGreaterThan(90);
  });

  // ── 2. Duplicate Detection ──
  it('should detect potential candidate duplicates within spatial proximity threshold', async () => {
    const report = await memoryCitizenReportRepository.findById('cit-rep-101');
    expect(report).not.toBeNull();

    if (report) {
      const candidates = await duplicateReportDetectionService.findDuplicates(report);
      expect(Array.isArray(candidates)).toBe(true);
    }
  });

  // ── 3. Resolution Verification ──
  it('should process citizen resolution verification and transition state to CITIZEN_VERIFIED', async () => {
    const updated = await citizenFeedbackService.processVerification({
      reportId: 'cit-rep-101',
      citizenId: 'usr-cit-101',
      verificationOption: 'CONFIRM_RESOLVED',
    });

    expect(updated.status).toBe('CITIZEN_VERIFIED');
  });

  // ── 4. Feedback & Satisfaction Metrics ──
  it('should record citizen feedback ratings and compute average satisfaction metrics', async () => {
    const fb = await citizenFeedbackService.recordFeedback({
      reportId: 'cit-rep-101',
      citizenId: 'usr-cit-101',
      satisfactionScore: 5,
      resolutionQualityScore: 5,
      responseSpeedScore: 4,
      communicationQualityScore: 5,
      comments: 'Excellent repair work by municipal team.',
    });

    expect(fb.id).toBeDefined();
    expect(fb.satisfactionScore).toBe(5);

    const metrics = await memoryCitizenFeedbackRepository.getMetrics();
    expect(metrics.totalResponses).toBeGreaterThan(0);
    expect(metrics.averageSatisfaction).toBeGreaterThan(0);
  });
});
