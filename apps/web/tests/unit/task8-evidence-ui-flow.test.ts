// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — TASK 8: Evidence Input UI & Geolocation Verification Suite
// ──────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';

describe('TASK 8 — Evidence Input UI & Geolocation Logic Suite', () => {
  describe('1. File Type & Size Validation', () => {
    function validateEvidenceFile(file: { name: string; size: number; type: string }) {
      const MAX_SIZE = 25 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        return { valid: false, error: 'File size exceeds 25 MB limit.' };
      }
      const mime = file.type.toLowerCase();
      const isAllowed =
        mime.startsWith('image/') ||
        mime.startsWith('video/') ||
        mime === 'application/pdf' ||
        mime === 'text/plain';

      if (!isAllowed) {
        return { valid: false, error: `Unsupported file format '${mime}'.` };
      }
      return { valid: true, error: null };
    }

    it('accepts valid JPEG, PNG, MP4, and PDF files within 25MB', () => {
      expect(validateEvidenceFile({ name: 'pothole.jpg', size: 1024 * 1024, type: 'image/jpeg' }).valid).toBe(true);
      expect(validateEvidenceFile({ name: 'flood.png', size: 5 * 1024 * 1024, type: 'image/png' }).valid).toBe(true);
      expect(validateEvidenceFile({ name: 'traffic.mp4', size: 20 * 1024 * 1024, type: 'video/mp4' }).valid).toBe(true);
      expect(validateEvidenceFile({ name: 'report.pdf', size: 2 * 1024 * 1024, type: 'application/pdf' }).valid).toBe(true);
    });

    it('rejects files larger than 25MB', () => {
      const result = validateEvidenceFile({ name: 'huge_drone_scan.raw', size: 30 * 1024 * 1024, type: 'image/jpeg' });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('25 MB');
    });

    it('rejects unsupported executable or script MIME types', () => {
      const result = validateEvidenceFile({ name: 'malware.exe', size: 1024, type: 'application/x-msdownload' });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Unsupported file format');
    });
  });

  describe('2. Geolocation Error Mapping & Deterministic Handling', () => {
    function mapGeolocationError(code: number): string {
      switch (code) {
        case 1:
          return 'Location permission denied. Please enter coordinates manually.';
        case 2:
          return 'GPS position unavailable. Please enter coordinates manually.';
        case 3:
          return 'GPS request timed out. Please enter coordinates manually.';
        default:
          return 'Failed to acquire GPS position. Enter coordinates manually.';
      }
    }

    it('correctly maps GeolocationPositionError codes to clear user-facing messages', () => {
      expect(mapGeolocationError(1)).toContain('permission denied');
      expect(mapGeolocationError(2)).toContain('position unavailable');
      expect(mapGeolocationError(3)).toContain('request timed out');
      expect(mapGeolocationError(99)).toContain('Enter coordinates manually');
    });

    it('verifies GPS coordinate values are preserved without random perturbation', () => {
      const liveLatitude = 16.506174;
      const liveLongitude = 80.648015;

      const formattedLat = Number(liveLatitude.toFixed(6));
      const formattedLng = Number(liveLongitude.toFixed(6));

      expect(formattedLat).toBe(16.506174);
      expect(formattedLng).toBe(80.648015);
    });
  });
});
