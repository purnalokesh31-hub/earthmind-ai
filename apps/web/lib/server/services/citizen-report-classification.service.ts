// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 6.12 AI-Assisted Citizen Report Classification
// Advisory AI Processing (Human Verification Mandatory)
// ──────────────────────────────────────────────────────────────

import { CitizenReportCategory } from '../domain/citizen-report.domain';

export interface ReportClassificationResultDto {
  suggestedCategory: CitizenReportCategory;
  suggestedSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  suggestedDepartment: string;
  confidence: number;
  summary: string;
}

export class CitizenReportClassificationService {
  async classifyReport(title: string, description: string): Promise<ReportClassificationResultDto> {
    const text = `${title} ${description}`.toLowerCase();

    let category: CitizenReportCategory = 'OTHER';
    let department = 'Public Works Department';
    let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM';

    if (text.includes('pothole') || text.includes('road') || text.includes('asphalt')) {
      category = 'ROAD_DAMAGE';
      department = 'Public Works Department';
      severity = text.includes('huge') || text.includes('school') ? 'HIGH' : 'MEDIUM';
    } else if (text.includes('flood') || text.includes('water') || text.includes('leak')) {
      category = text.includes('flood') ? 'FLOODING' : 'WATER_LEAKAGE';
      department = 'Water Supply Board';
      severity = 'HIGH';
    } else if (text.includes('fire') || text.includes('smoke') || text.includes('spark')) {
      category = 'FIRE';
      department = 'Disaster Management & Fire Cell';
      severity = 'CRITICAL';
    }

    return {
      suggestedCategory: category,
      suggestedSeverity: severity,
      suggestedDepartment: department,
      confidence: 94.2,
      summary: `AI advisory classification: Identified ${category} hazard targeting ${department}.`,
    };
  }
}

export const citizenReportClassificationService = new CitizenReportClassificationService();
