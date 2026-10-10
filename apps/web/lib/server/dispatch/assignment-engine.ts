// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Autonomous Responder Assignment Engine
// Deterministic Scoring: Severity + Skill + Proximity + Workload + Availability
// ──────────────────────────────────────────────────────────────

import { gisIntelligenceService } from '../gis/gis-intelligence.service';
import { logger } from '../logger';

export interface OfficerCandidate {
  id: string;
  fullName: string;
  departmentId: string;
  role: string;
  skills: string[];
  currentLatitude: number;
  currentLongitude: number;
  activeAssignmentsCount: number;
  isAvailable: boolean;
}

export interface IncidentAssignmentTarget {
  incidentId: string;
  category: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  latitude: number;
  longitude: number;
  departmentId?: string;
  requiredSkills?: string[];
}

export interface AssignmentRecommendation {
  officerId: string;
  officerName: string;
  departmentId: string;
  score: number; // 0 to 100
  distanceKm: number;
  estimatedResponseMinutes: number;
  reasons: string[];
  confidence: number;
}

export class AssignmentEngine {
  recommendBestResponder(
    target: IncidentAssignmentTarget,
    candidates: OfficerCandidate[]
  ): AssignmentRecommendation | null {
    if (!candidates || candidates.length === 0) {
      logger.warn(`[AssignmentEngine] No officer candidates available for incident ${target.incidentId}`);
      return null;
    }

    const availableCandidates = candidates.filter((c) => c.isAvailable);
    const pool = availableCandidates.length > 0 ? availableCandidates : candidates;

    let bestCandidate: OfficerCandidate | null = null;
    let highestScore = -1;
    let bestRecommendation: AssignmentRecommendation | null = null;

    for (const candidate of pool) {
      const reasons: string[] = [];

      // 1. Proximity Calculation via GisIntelligenceService Haversine
      const distanceMeters = gisIntelligenceService.calculateHaversineDistance(
        { latitude: target.latitude, longitude: target.longitude },
        { latitude: candidate.currentLatitude, longitude: candidate.currentLongitude }
      );
      const distanceKm = Number((distanceMeters / 1000).toFixed(2));

      // Proximity Weight (max 30 pts)
      let proximityWeight = Math.max(0, 30 - Math.round(distanceKm * 2));
      reasons.push(`Proximity: ${distanceKm} km from incident location (${proximityWeight}/30 pts).`);

      // 2. Department Alignment Weight (max 25 pts)
      let deptWeight = 10;
      if (target.departmentId && candidate.departmentId === target.departmentId) {
        deptWeight = 25;
        reasons.push(`Department Match: Directly assigned to target department (${deptWeight}/25 pts).`);
      } else {
        reasons.push(`Cross-Department Eligible (${deptWeight}/25 pts).`);
      }

      // 3. Workload Weight (max 20 pts)
      const activeCount = candidate.activeAssignmentsCount;
      let workloadWeight = Math.max(0, 20 - activeCount * 5);
      reasons.push(`Workload: ${activeCount} active incident(s) assigned (${workloadWeight}/20 pts).`);

      // 4. Availability & Skill Weight (max 25 pts)
      let skillMatchWeight = 15;
      if (target.requiredSkills && target.requiredSkills.length > 0) {
        const matched = target.requiredSkills.filter((s) => candidate.skills.includes(s)).length;
        skillMatchWeight = Math.min(25, matched * 10 + 5);
        reasons.push(`Skill Alignment: Matched ${matched} required skill(s) (${skillMatchWeight}/25 pts).`);
      } else {
        reasons.push(`Role & General Skill Certified (${skillMatchWeight}/25 pts).`);
      }

      // Total Composite Assignment Score (0-100)
      const score = Math.min(100, Math.max(0, proximityWeight + deptWeight + workloadWeight + skillMatchWeight));

      // Estimated Response Time (15 km/h urban response speed estimate + 5 min prep)
      const estimatedResponseMinutes = Math.max(5, Math.round((distanceKm / 15) * 60 + 5));

      if (score > highestScore) {
        highestScore = score;
        bestCandidate = candidate;
        bestRecommendation = {
          officerId: candidate.id,
          officerName: candidate.fullName,
          departmentId: candidate.departmentId,
          score,
          distanceKm,
          estimatedResponseMinutes,
          reasons,
          confidence: Number((score / 100).toFixed(2)),
        };
      }
    }

    if (bestRecommendation && bestCandidate) {
      logger.info(`[AssignmentEngine] Recommended ${bestCandidate.fullName} (${bestCandidate.id}) for incident ${target.incidentId} with score ${highestScore}/100`);
    }

    return bestRecommendation;
  }
}

export const assignmentEngine = new AssignmentEngine();
