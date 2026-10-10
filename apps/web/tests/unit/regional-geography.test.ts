// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 6.9 Enterprise Multi-City & Regional Specs
// ──────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { memoryGeographyRepository, memoryRegionalEventRepository } from '../../lib/server/repositories/geography.repository';
import { jurisdictionResolverService } from '../../lib/server/services/jurisdiction-resolver.service';
import { regionalRiskEngine } from '../../lib/server/services/regional-risk.engine';
import { regionalResourceService } from '../../lib/server/services/regional-resource.service';

describe('Phase 6.9 — Enterprise Multi-City Geospatial Intelligence & Regional Operations Suite', () => {
  // ── 1. Geographic Domain Hierarchy & Repositories ──
  it('should list and retrieve regions, districts, cities, and operational zones', async () => {
    const regions = await memoryGeographyRepository.listRegions();
    expect(regions.length).toBeGreaterThan(0);

    const cities = await memoryGeographyRepository.listCities();
    expect(cities.length).toBeGreaterThanOrEqual(3);

    const vijayawada = await memoryGeographyRepository.findCityById('city-vja');
    expect(vijayawada?.name).toBe('Vijayawada Municipal Corporation');
    expect(vijayawada?.latitude).toBe(16.5060);
  });

  // ── 2. Point-in-Polygon Jurisdiction Resolution ──
  it('should resolve coordinates [16.5060, 80.6350] to Vijayawada Ward 12 jurisdiction', async () => {
    const resolved = await jurisdictionResolverService.resolveCoordinates(16.5060, 80.6350);
    expect(resolved.countryName).toBe('India');
    expect(resolved.stateName).toBe('Andhra Pradesh');
    expect(resolved.cityName).toContain('Vijayawada');
    expect(resolved.zoneName).toContain('Ward 12');
  });

  // ── 3. Regional Risk Engine & Event Aggregation ──
  it('should calculate aggregated regional risk score and classify regional risk level', async () => {
    const assessment = await regionalRiskEngine.assessRegionalRisk('REGION', 'reg-ap-central');
    expect(assessment.regionalRiskScore).toBeGreaterThan(0);
    expect(['REGIONAL_LOW', 'REGIONAL_MODERATE', 'REGIONAL_HIGH', 'REGIONAL_CRITICAL']).toContain(assessment.regionalRiskLevel);
    expect(assessment.activeRegionalEvents.length).toBeGreaterThan(0);
  });

  // ── 4. Cross-City Resource Intelligence & Recommendations ──
  it('should compute city workload indices and generate cross-city dispatch recommendations', async () => {
    const workloads = await regionalResourceService.getCityWorkloads();
    expect(workloads.length).toBe(3);

    const vjaWorkload = workloads.find((w) => w.cityId === 'city-vja');
    expect(vjaWorkload?.needsSupport).toBe(true);

    const recs = await regionalResourceService.generateCrossCityDispatchRecommendations();
    expect(recs.length).toBeGreaterThan(0);
    expect(recs[0].recommendedSupportCityId).toBe('city-gtr');
    expect(recs[0].estimatedTravelTimeMinutes).toBeLessThan(60);
  });

  // ── 5. Regional Event Repository ──
  it('should retrieve active regional events and maintain bounds', async () => {
    const activeEvents = await memoryRegionalEventRepository.findActiveEvents();
    expect(activeEvents.length).toBeGreaterThan(0);
    expect(activeEvents[0].affectedCities).toContain('Vijayawada');
  });
});
