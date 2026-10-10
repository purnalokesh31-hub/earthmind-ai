import { describe, it, expect } from 'vitest';
import { EvidenceFactory, EvidenceValidator, EvidenceStatus } from '../../lib/domain/evidence';
import { LocalStorageProvider } from '../../lib/server/storage/local-storage.provider';

describe('Phase 6.5.1 — Enterprise Evidence Domain & Storage Platform', () => {
  it('should create a valid EvidenceEntity aggregate root', () => {
    const evidence = EvidenceFactory.create({
      incidentId: 'inc-evd-101',
      uploaderId: 'usr-officer-99',
      fileName: 'satellite_spill_scan.jpg',
      fileUrl: '/storage/evidence/satellite_spill_scan.jpg',
      mediaType: 'image/jpeg',
      fileSizeBytes: 2048500,
      tags: ['satellite', 'spill'],
    });

    expect(evidence.id).toContain('evd-');
    expect(evidence.category).toBe('IMAGE');
    expect(evidence.status).toBe('ACTIVE');
    expect(evidence.version).toBe(1);
    expect(evidence.tags).toContain('satellite');
  });

  it('should validate allowed mime types and file sizes', () => {
    expect(() => EvidenceValidator.validateFileSize(0)).toThrow('greater than 0');
    expect(() => EvidenceValidator.validateFileSize(150 * 1024 * 1024)).toThrow('exceeds maximum limit');
    expect(() => EvidenceValidator.validateMimeType('application/x-executable')).toThrow('Unsupported evidence MIME type');
  });

  it('should handle status transitions correctly', () => {
    const evidence = EvidenceFactory.create({
      incidentId: 'inc-evd-102',
      uploaderId: 'usr-officer-99',
      fileName: 'drone_feed.mp4',
      fileUrl: '/storage/evidence/drone_feed.mp4',
      mediaType: 'video/mp4',
      fileSizeBytes: 15485000,
    });

    evidence.transitionStatus('FLAGGED');
    expect(evidence.status).toBe('FLAGGED');

    evidence.transitionStatus('DELETED');
    expect(evidence.status).toBe('DELETED');
    expect(evidence.deletedAt).toBeDefined();

    evidence.restore();
    expect(evidence.status).toBe('ACTIVE');
  });

  it('should execute storage provider key generation & path resolution', async () => {
    const provider = new LocalStorageProvider();
    const fileBuffer = Buffer.from('EarthMind Evidence Sample Stream Data');
    const result = await provider.uploadFile({
      content: fileBuffer,
      fileName: 'sample_sensor.json',
      mimeType: 'application/json',
    });

    expect(result.fileKey).toContain('sample_sensor.json');
    expect(result.url).toBeDefined();
    expect(result.sizeBytes).toBe(fileBuffer.length);
  });
});
