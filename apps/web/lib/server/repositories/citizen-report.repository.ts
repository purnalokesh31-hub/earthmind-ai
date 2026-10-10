// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 6.12 Citizen Report & Feedback Repositories
// ──────────────────────────────────────────────────────────────

import {
  CitizenReportEntity,
  CitizenFeedbackEntity,
} from '../domain/citizen-report.domain';

export interface ICitizenReportRepository {
  findById(id: string): Promise<CitizenReportEntity | null>;
  findByCitizenId(citizenId: string): Promise<CitizenReportEntity[]>;
  listSubmitted(): Promise<CitizenReportEntity[]>;
  save(report: CitizenReportEntity): Promise<CitizenReportEntity>;
}

export interface ICitizenFeedbackRepository {
  save(feedback: CitizenFeedbackEntity): Promise<CitizenFeedbackEntity>;
  listByReportId(reportId: string): Promise<CitizenFeedbackEntity[]>;
  getMetrics(): Promise<{ averageSatisfaction: number; totalResponses: number }>;
}

export class MemoryCitizenReportRepository implements ICitizenReportRepository {
  private reports: CitizenReportEntity[] = [
    {
      id: 'cit-rep-101',
      reportCode: 'CIT-2026-001',
      citizenId: 'usr-cit-101',
      citizenNameMasked: 'P**** K****',
      category: 'ROAD_DAMAGE',
      title: 'Deep Pothole near Benz Circle School Junction',
      description: 'Severe road deformation endangering two-wheelers during heavy monsoon runoff.',
      locationName: 'Ward 12, Benz Circle Junction',
      latitude: 16.5060,
      longitude: 80.6350,
      locationSource: 'DEVICE_GPS',
      accuracyMeters: 18,
      cityId: 'city-vja',
      zoneId: 'zone-w12',
      status: 'UNDER_REVIEW',
      priority: 'HIGH',
      visibility: 'ANONYMOUS_PUBLIC',
      evidenceIds: ['ev-101'],
      consent: {
        dataProcessingConsent: true,
        publicDisplayConsent: true,
        contactConsent: true,
        consentedAt: new Date(),
      },
      aiClassification: {
        suggestedCategory: 'ROAD_DAMAGE',
        suggestedSeverity: 'HIGH',
        suggestedDepartment: 'Public Works Department',
        confidence: 94.2,
        summary: 'AI Vision confirmed road surface breach & pothole subsidence near school zone.',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  async findById(id: string): Promise<CitizenReportEntity | null> {
    return this.reports.find((r) => r.id === id) || null;
  }

  async findByCitizenId(citizenId: string): Promise<CitizenReportEntity[]> {
    return this.reports.filter((r) => r.citizenId === citizenId);
  }

  async listSubmitted(): Promise<CitizenReportEntity[]> {
    return this.reports;
  }

  async save(report: CitizenReportEntity): Promise<CitizenReportEntity> {
    const idx = this.reports.findIndex((r) => r.id === report.id);
    if (idx >= 0) this.reports[idx] = report;
    else this.reports.push(report);
    return report;
  }
}

export class MemoryCitizenFeedbackRepository implements ICitizenFeedbackRepository {
  private feedbackList: CitizenFeedbackEntity[] = [
    {
      id: 'fb-cit-1',
      reportId: 'cit-rep-101',
      citizenId: 'usr-cit-101',
      satisfactionScore: 5,
      resolutionQualityScore: 5,
      responseSpeedScore: 4,
      communicationQualityScore: 5,
      comments: 'Prompt response by Public Works team. Repair completed within 24h.',
      createdAt: new Date(),
    },
  ];

  async save(feedback: CitizenFeedbackEntity): Promise<CitizenFeedbackEntity> {
    this.feedbackList.push(feedback);
    return feedback;
  }

  async listByReportId(reportId: string): Promise<CitizenFeedbackEntity[]> {
    return this.feedbackList.filter((f) => f.reportId === reportId);
  }

  async getMetrics(): Promise<{ averageSatisfaction: number; totalResponses: number }> {
    if (this.feedbackList.length === 0) return { averageSatisfaction: 0, totalResponses: 0 };
    const sum = this.feedbackList.reduce((acc, f) => acc + f.satisfactionScore, 0);
    return {
      averageSatisfaction: Number((sum / this.feedbackList.length).toFixed(1)),
      totalResponses: this.feedbackList.length,
    };
  }
}

export const memoryCitizenReportRepository = new MemoryCitizenReportRepository();
export const memoryCitizenFeedbackRepository = new MemoryCitizenFeedbackRepository();
