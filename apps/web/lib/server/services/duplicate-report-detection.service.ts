// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 6.12 Duplicate Report Detection Service
// ──────────────────────────────────────────────────────────────

import { memoryCitizenReportRepository } from '../repositories/citizen-report.repository';
import { DuplicateCandidateDto, CitizenReportEntity } from '../domain/citizen-report.domain';

export class DuplicateReportDetectionService {
  async findDuplicates(report: CitizenReportEntity): Promise<DuplicateCandidateDto[]> {
    const existingReports = await memoryCitizenReportRepository.listSubmitted();

    const duplicates: DuplicateCandidateDto[] = [];

    for (const other of existingReports) {
      if (other.id === report.id) continue;
      if (
        report.latitude === undefined ||
        report.longitude === undefined ||
        other.latitude === undefined ||
        other.longitude === undefined
      ) {
        continue;
      }

      // Spatial distance calculation (Haversine formula approximation)
      const dLat = (other.latitude - report.latitude) * 111000;
      const dLng = (other.longitude - report.longitude) * 111000 * Math.cos((report.latitude * Math.PI) / 180);
      const distanceMeters = Math.round(Math.sqrt(dLat * dLat + dLng * dLng));

      if (distanceMeters <= 200 && other.category === report.category) {
        duplicates.push({
          reportId: report.id,
          matchingReportId: other.id,
          similarityScore: 92.5,
          distanceMeters,
          reasoning: [
            `Geographic proximity within ${distanceMeters}m radius`,
            `Category match: ${report.category}`,
          ],
        });
      }
    }

    return duplicates;
  }
}

export const duplicateReportDetectionService = new DuplicateReportDetectionService();
