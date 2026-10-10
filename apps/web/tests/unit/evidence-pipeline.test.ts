import { describe, it, expect } from 'vitest';
import { EvidenceLifecycle } from '../../lib/domain/evidence/evidence-lifecycle';
import { encryptionService } from '../../lib/server/security/encryption.service';
import { antivirusService } from '../../lib/server/antivirus/antivirus.service';
import { cdnService } from '../../lib/server/cdn/cdn.service';
import { jobQueue } from '../../lib/server/queue/job-queue.service';
import { storageLifecycleService } from '../../lib/server/storage/storage-lifecycle.service';

describe('Phase 6.5.5 — Enterprise Storage, Processing & Observability Enhancement', () => {
  // ── State Transitions ──
  describe('Extended Evidence Lifecycle State Machine', () => {
    it('should validate legal transitions from UPLOADING to VERIFIED', () => {
      expect(EvidenceLifecycle.canTransition('UPLOADING', 'UPLOADED')).toBe(true);
      expect(EvidenceLifecycle.canTransition('UPLOADED', 'VALIDATING')).toBe(true);
      expect(EvidenceLifecycle.canTransition('VALIDATING', 'VIRUS_SCANNING')).toBe(true);
      expect(EvidenceLifecycle.canTransition('VIRUS_SCANNING', 'PROCESSING')).toBe(true);
      expect(EvidenceLifecycle.canTransition('PROCESSING', 'OCR_COMPLETE')).toBe(true);
      expect(EvidenceLifecycle.canTransition('OCR_COMPLETE', 'THUMBNAIL_READY')).toBe(true);
      expect(EvidenceLifecycle.canTransition('THUMBNAIL_READY', 'VERIFIED')).toBe(true);
    });

    it('should reject invalid transitions like UPLOADING to AI_COMPLETE', () => {
      expect(EvidenceLifecycle.canTransition('UPLOADING', 'AI_COMPLETE')).toBe(false);
      expect(() => EvidenceLifecycle.validateTransition('UPLOADING', 'AI_COMPLETE')).toThrow('Illegal evidence lifecycle state transition');
    });

    it('should allow restoration from DELETED to VERIFIED', () => {
      expect(EvidenceLifecycle.canTransition('DELETED', 'VERIFIED')).toBe(true);
    });

    it('should support archival transitions from VERIFIED to ARCHIVED', () => {
      expect(EvidenceLifecycle.canTransition('VERIFIED', 'ARCHIVED')).toBe(true);
    });
  });

  // ── Encryption Service ──
  describe('AES-256-GCM Envelope Encryption', () => {
    it('should encrypt and decrypt buffer payloads with auth tag verification', async () => {
      const originalText = 'EarthMind Confidential Sensor Payload Security Stream';
      const buffer = Buffer.from(originalText, 'utf8');

      const encrypted = await encryptionService.encryptBuffer(buffer);
      expect(encrypted.cipherText).toBeDefined();
      expect(encrypted.iv.length).toBe(12);
      expect(encrypted.authTag.length).toBe(16);

      const decrypted = await encryptionService.decryptBuffer(encrypted);
      expect(decrypted.toString('utf8')).toBe(originalText);
    });

    it('should reject tampered auth tags during decryption', async () => {
      const buffer = Buffer.from('Sensitive Evidence String', 'utf8');
      const encrypted = await encryptionService.encryptBuffer(buffer);

      // Corrupt auth tag
      encrypted.authTag[0] ^= 0xff;
      await expect(encryptionService.decryptBuffer(encrypted)).rejects.toThrow();
    });
  });

  // ── Antivirus Pipeline ──
  describe('Malware Scanning Pipeline', () => {
    it('should detect clean buffers', async () => {
      const cleanBuffer = Buffer.from('Standard non-malicious evidence asset');
      const result = await antivirusService.scanFile(cleanBuffer, 'clean.txt');
      expect(result.isClean).toBe(true);
    });

    it('should intercept malware signature in buffer', async () => {
      const eicarBuffer = Buffer.from('X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*');
      const result = await antivirusService.scanFile(eicarBuffer, 'virus.txt');
      expect(result.isClean).toBe(false);
      expect(result.threatName).toBe('EICAR-Test-Signature');
    });
  });

  // ── CDN Service ──
  describe('CDN & Signed Presigned URL Service', () => {
    it('should issue signed presigned URLs with configurable TTL', async () => {
      const url = await cdnService.getSignedUrl('evidence/sample-101.jpg', 600);
      expect(url).toContain('/cdn/evidence/sample-101.jpg');
      expect(url).toContain('signature=');
      expect(url).toContain('expires=');
    });
  });

  // ── Background Job System ──
  describe('Background Processing Queue & Dead Letter Queue (DLQ)', () => {
    it('should enqueue and process background OCR jobs', async () => {
      let processedId = '';
      jobQueue.process('OCR_PROCESSING', async (job) => {
        processedId = (job.payload as any).evidenceId;
      });

      await jobQueue.enqueue('OCR_PROCESSING', { evidenceId: 'evd-queue-99' }, 10);
      await new Promise((r) => setTimeout(r, 50));

      expect(processedId).toBe('evd-queue-99');
    });

    it('should move failing jobs to Dead Letter Queue (DLQ) after max retries', async () => {
      jobQueue.process('METADATA_EXTRACTION', async () => {
        throw new Error('Simulated Extraction Failure');
      });

      await jobQueue.enqueue('METADATA_EXTRACTION', { evidenceId: 'evd-fail-101' }, 1);
      await new Promise((r) => setTimeout(r, 100));

      const dlq = jobQueue.getDeadLetterQueue();
      expect(dlq.length).toBeGreaterThan(0);
      expect(dlq[dlq.length - 1].failedReason).toBe('Simulated Extraction Failure');
    });
  });

  // ── Storage Lifecycle ──
  describe('Storage Lifecycle & Retention Engine', () => {
    it('should assign HOT tier for newly uploaded evidence', () => {
      const tier = storageLifecycleService.determineTier(new Date());
      expect(tier).toBe('HOT');
    });

    it('should assign ARCHIVE tier when legal hold is active', () => {
      const tier = storageLifecycleService.determineTier(new Date(), true);
      expect(tier).toBe('ARCHIVE');
    });

    it('should transition storage tiers', async () => {
      const newTier = await storageLifecycleService.transitionTier('evd-99', 'HOT', 'WARM');
      expect(newTier).toBe('WARM');
    });

    it('should mark old un-locked evidence as RETENTION_DELETED after 7 years', () => {
      const oldDate = new Date(Date.now() - 3000 * 24 * 60 * 60 * 1000);
      const tier = storageLifecycleService.determineTier(oldDate, false);
      expect(tier).toBe('RETENTION_DELETED');
    });
  });
});
