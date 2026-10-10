// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 6.12 Resolution Verification & Feedback Service
// ──────────────────────────────────────────────────────────────

import { memoryCitizenReportRepository, memoryCitizenFeedbackRepository } from '../repositories/citizen-report.repository';
import { CitizenReportEntity, CitizenFeedbackEntity } from '../domain/citizen-report.domain';

export interface SubmitVerificationRequest {
  reportId: string;
  citizenId: string;
  verificationOption: 'CONFIRM_RESOLVED' | 'NOT_RESOLVED' | 'PARTIALLY_RESOLVED';
  note?: string;
}

export interface SubmitFeedbackRequest {
  reportId: string;
  citizenId: string;
  satisfactionScore: number;
  resolutionQualityScore: number;
  responseSpeedScore: number;
  communicationQualityScore: number;
  comments?: string;
}

export class CitizenFeedbackService {
  async processVerification(req: SubmitVerificationRequest): Promise<CitizenReportEntity> {
    const report = await memoryCitizenReportRepository.findById(req.reportId);
    if (!report) throw new Error(`Report ${req.reportId} not found`);

    if (req.verificationOption === 'CONFIRM_RESOLVED') {
      report.status = 'CITIZEN_VERIFIED';
    } else if (req.verificationOption === 'NOT_RESOLVED') {
      report.status = 'REOPENED';
    } else if (req.verificationOption === 'PARTIALLY_RESOLVED') {
      report.status = 'UNDER_REVIEW';
    }

    report.updatedAt = new Date();
    return memoryCitizenReportRepository.save(report);
  }

  async recordFeedback(req: SubmitFeedbackRequest): Promise<CitizenFeedbackEntity> {
    const fb: CitizenFeedbackEntity = {
      id: `fb-${Date.now()}`,
      reportId: req.reportId,
      citizenId: req.citizenId,
      satisfactionScore: Math.min(5, Math.max(1, req.satisfactionScore)),
      resolutionQualityScore: Math.min(5, Math.max(1, req.resolutionQualityScore)),
      responseSpeedScore: Math.min(5, Math.max(1, req.responseSpeedScore)),
      communicationQualityScore: Math.min(5, Math.max(1, req.communicationQualityScore)),
      comments: req.comments,
      createdAt: new Date(),
    };

    return memoryCitizenFeedbackRepository.save(fb);
  }
}

export const citizenFeedbackService = new CitizenFeedbackService();
