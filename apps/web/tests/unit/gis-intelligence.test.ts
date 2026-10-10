import { describe, it, expect } from 'vitest';
import { gisIntelligenceService, GisIntelligenceService } from '../../lib/server/gis/gis-intelligence.service';

describe('Phase 6.6.4 — Geospatial Intelligence & GIS Platform Engine', () => {
  // ── Haversine Distance & Spatial Calculations ──
  describe('Spatial Metrics & Distance Calculations', () => {
    it('should calculate accurate Haversine distance between coordinates', () => {
      const p1 = { latitude: 16.5060, longitude: 80.6350 };
      const p2 = { latitude: 16.5160, longitude: 80.6450 }; // ~1.5 km distance

      const distanceMeters = gisIntelligenceService.calculateHaversineDistance(p1, p2);
      expect(distanceMeters).toBeGreaterThan(1000);
      expect(distanceMeters).toBeLessThan(2500);
    });

    it('should return 0 meters for identical coordinates', () => {
      const p = { latitude: 16.5060, longitude: 80.6350 };
      expect(gisIntelligenceService.calculateHaversineDistance(p, p)).toBe(0);
    });
  });

  // ── GeoJSON Generation & Risk Buffers ──
  describe('GeoJSON FeatureCollections & Risk Zones', () => {
    it('should generate valid GeoJSON FeatureCollection from incident data', () => {
      const mockIncidents = [
        { id: 'inc-101', title: 'Road Collapse', lat: 16.5060, lng: 80.6350, severity: 'critical' },
        { id: 'inc-102', title: 'Garbage Pile', lat: 16.5100, lng: 80.6400, severity: 'medium' },
      ];

      const geoJson = gisIntelligenceService.generateGeoJsonFeatureCollection(mockIncidents);
      expect(geoJson.type).toBe('FeatureCollection');
      expect(geoJson.features.length).toBe(2);
      expect(geoJson.features[0].geometry.coordinates).toEqual([80.6350, 16.5060]);
    });

    it('should compute 1000m risk buffer zone for critical incidents', () => {
      const p = { latitude: 16.5060, longitude: 80.6350 };
      const buffer = gisIntelligenceService.calculateRiskBuffer(p, 'critical');

      expect(buffer.radiusMeters).toBe(1000);
      expect(buffer.impactScore).toBe(95);
      expect(buffer.affectedWard).toContain('Ward 14');
    });
  });

  // ── Nearest Incident Locator ──
  describe('Spatial Nearest Neighbor Queries', () => {
    it('should find nearest incident to target coordinates', () => {
      const target = { latitude: 16.5060, longitude: 80.6350 };
      const candidates = [
        { id: 'far-inc', lat: 16.6000, lng: 80.7000 },
        { id: 'near-inc', lat: 16.5070, lng: 80.6360 }, // ~150m away
      ];

      const nearest = gisIntelligenceService.findNearestIncident(target, candidates);
      expect(nearest).not.toBeNull();
      expect(nearest?.nearestId).toBe('near-inc');
      expect(nearest?.distanceMeters).toBeLessThan(300);
    });
  });
});
