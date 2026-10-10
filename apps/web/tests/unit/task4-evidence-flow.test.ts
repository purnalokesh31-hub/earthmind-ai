// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — TASK 4: Real Evidence & Vision Flow Verification Suite
// ──────────────────────────────────────────────────────────────

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as uploadEvidenceRoute } from '@/app/api/v1/evidence/upload/route';
import { POST as analyzeVisionRoute } from '@/app/api/v1/vision/analyze/route';
import { IEvidenceRepository } from '@/lib/server/repositories/evidence.repository';
import { IStorageProvider } from '@/lib/server/storage/storage.interface';
import container, { TOKENS } from '@/lib/server/container';
import { JwtService } from '@/lib/server/auth/jwt.service';
import { aiInferenceService } from '@/lib/server/ai/ai-inference.service';

describe('TASK 4 — Real Evidence & Vision Flow Suite', () => {
  const jwtService = new JwtService();
  let evidenceRepo: IEvidenceRepository;
  let storageProvider: IStorageProvider;

  beforeEach(() => {
    evidenceRepo = container.resolve<IEvidenceRepository>(TOKENS.EvidenceRepository);
    storageProvider = container.resolve<IStorageProvider>(TOKENS.StorageProvider);
  });

  async function createAuthHeaders(userId = 'usr-test-officer', role: 'FIELD_OFFICER' | 'COMMANDER' | 'SYSTEM_ADMIN' | 'CITIZEN' = 'FIELD_OFFICER') {
    const token = await jwtService.generateAccessToken({
      sub: userId,
      email: `${userId}@earthmind.test`,
      role,
      jti: `jti-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    });
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  describe('1. Evidence Upload Authentication & Validation', () => {
    it('rejects unauthenticated upload requests with HTTP 401', async () => {
      const formData = new FormData();
      formData.append('file', new File(['dummy content'], 'photo.jpg', { type: 'image/jpeg' }));

      const req = new NextRequest('http://localhost:3000/api/v1/evidence/upload', {
        method: 'POST',
        body: formData,
      });

      const res = await uploadEvidenceRoute(req);
      expect(res.status).toBe(401);
    });

    it('rejects upload when file is missing with HTTP 400', async () => {
      const headers = await createAuthHeaders();
      const formData = new FormData();
      formData.append('incidentId', 'inc-101');

      const req = new NextRequest('http://localhost:3000/api/v1/evidence/upload', {
        method: 'POST',
        headers,
        body: formData,
      });

      const res = await uploadEvidenceRoute(req);
      expect(res.status).toBe(400);
    });

    it('rejects unsupported file MIME types with HTTP 400', async () => {
      const headers = await createAuthHeaders();
      const formData = new FormData();
      formData.append('file', new File(['malicious executable'], 'virus.exe', { type: 'application/x-msdownload' }));

      const req = new NextRequest('http://localhost:3000/api/v1/evidence/upload', {
        method: 'POST',
        headers,
        body: formData,
      });

      const res = await uploadEvidenceRoute(req);
      expect(res.status).toBe(400);
    });

    it('successfully uploads valid image file, persists in storage, and associates with user', async () => {
      const headers = await createAuthHeaders('usr-uploader-42', 'FIELD_OFFICER');
      const formData = new FormData();
      formData.append('file', new File(['real image bytes'], 'road_crack.png', { type: 'image/png' }));
      formData.append('incidentId', 'inc-road-99');

      const req = new NextRequest('http://localhost:3000/api/v1/evidence/upload', {
        method: 'POST',
        headers,
        body: formData,
      });

      const res = await uploadEvidenceRoute(req);
      expect(res.status).toBe(201);
      const json = await res.json();

      expect(json.success).toBe(true);
      expect(json.data.evidenceId).toBeDefined();
      expect(json.data.fileName).toBe('road_crack.png');
      expect(json.data.fileType).toBe('IMAGE');
      expect(json.data.uploadedByUserId).toBe('usr-uploader-42');
      expect(json.data.linkedIncidentId).toBe('inc-road-99');
      expect(json.data.storageUrl).toBeDefined();

      const saved = await evidenceRepo.findById(json.data.evidenceId);
      expect(saved).not.toBeNull();
      expect(saved?.uploadedByUserId).toBe('usr-uploader-42');
    });
  });

  describe('2. Vision Analysis Authentication & Authorization', () => {
    it('rejects unauthenticated vision analyze requests with HTTP 401', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/vision/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evidenceId: 'ev-test-101', modelTask: 'road_damage' }),
      });

      const res = await analyzeVisionRoute(req);
      expect(res.status).toBe(401);
    });

    it('returns HTTP 404 for invalid/nonexistent evidence IDs', async () => {
      const headers = await createAuthHeaders('usr-commander', 'COMMANDER');
      const req = new NextRequest('http://localhost:3000/api/v1/vision/analyze', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ evidenceId: 'nonexistent-ev-id-99999', modelTask: 'road_damage' }),
      });

      const res = await analyzeVisionRoute(req);
      expect(res.status).toBe(404);
    });

    it('prevents unauthorized users from accessing another users evidence with HTTP 403', async () => {
      const evidence = await evidenceRepo.create({
        fileName: 'private_leak.jpg',
        fileType: 'IMAGE',
        mimeType: 'image/jpeg',
        sizeBytes: 1024,
        storageUrl: '/uploads/private_leak.jpg',
        status: 'PENDING',
        uploadedByUserId: 'usr-owner-A',
      });

      const headers = await createAuthHeaders('usr-intruder-B', 'CITIZEN');
      const req = new NextRequest('http://localhost:3000/api/v1/vision/analyze', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ evidenceId: evidence.id, modelTask: 'road_damage' }),
      });

      const res = await analyzeVisionRoute(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error.message).toContain('not authorized to analyze evidence uploaded by another user');
    });

    it('returns HTTP 400 when attempting vision analysis on non-image evidence', async () => {
      const pdfEvidence = await evidenceRepo.create({
        fileName: 'municipal_report.pdf',
        fileType: 'DOCUMENT',
        mimeType: 'application/pdf',
        sizeBytes: 50000,
        storageUrl: '/uploads/report.pdf',
        status: 'PENDING',
        uploadedByUserId: 'usr-doc-owner',
      });

      const headers = await createAuthHeaders('usr-doc-owner', 'FIELD_OFFICER');
      const req = new NextRequest('http://localhost:3000/api/v1/vision/analyze', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ evidenceId: pdfEvidence.id, modelTask: 'road_damage' }),
      });

      const res = await analyzeVisionRoute(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error.message).toContain('Only image evidence can be analyzed');
    });

    it('returns explicit 400 when unsupported AI model task requested', async () => {
      const imgEvidence = await evidenceRepo.create({
        fileName: 'test_damage.jpg',
        fileType: 'IMAGE',
        mimeType: 'image/jpeg',
        sizeBytes: 4096,
        storageUrl: '/uploads/test_damage.jpg',
        status: 'PENDING',
        uploadedByUserId: 'usr-img-owner',
      });

      const headers = await createAuthHeaders('usr-img-owner', 'FIELD_OFFICER');
      const req = new NextRequest('http://localhost:3000/api/v1/vision/analyze', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evidenceId: imgEvidence.id,
          modelTask: 'unsupported_quantum_gravity_detector',
        }),
      });

      const res = await analyzeVisionRoute(req);
      expect(res.status).toBe(400);
    });

    it('executes real vision AI pipeline on valid image and updates evidence status to ANALYZED', async () => {
      const uploaded = await storageProvider.uploadFile({
        fileName: 'real_pothole.jpg',
        content: Buffer.from('real route image bytes'),
        mimeType: 'image/jpeg',
        folder: 'evidence',
      });
      const imgEvidence = await evidenceRepo.create({
        fileName: 'real_pothole.jpg',
        fileType: 'IMAGE',
        mimeType: 'image/jpeg',
        sizeBytes: uploaded.sizeBytes,
        storageUrl: uploaded.url,
        status: 'PENDING',
        uploadedByUserId: 'usr-pwd-officer',
      });
      const inferenceSpy = vi.spyOn(aiInferenceService, 'runInference');

      const headers = await createAuthHeaders('usr-pwd-officer', 'FIELD_OFFICER');
      const req = new NextRequest('http://localhost:3000/api/v1/vision/analyze', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evidenceId: imgEvidence.id,
          modelTask: 'road_damage',
        }),
      });

      const res = await analyzeVisionRoute(req);
      expect(res.status).toBe(200);
      const json = await res.json();

      expect(json.success).toBe(true);
      expect(json.data.evidenceId).toBe(imgEvidence.id);
      expect(json.data.inferenceId).toBeDefined();
      expect(json.data.detectedObjectsCount).toBeGreaterThan(0);
      expect(json.data.riskAssessment).toBeDefined();
      expect(inferenceSpy).toHaveBeenCalled();
      const imageBufferArg = inferenceSpy.mock.calls.at(-1)?.[1] as Buffer;
      expect(imageBufferArg.byteLength).toBeGreaterThan(0);
      expect(imageBufferArg.toString()).toBe('real route image bytes');
      inferenceSpy.mockRestore();

      const updated = await evidenceRepo.findById(imgEvidence.id);
      expect(updated?.status).toBe('ANALYZED');
    });

    it('returns typed HTTP 400 when image evidence bytes cannot be loaded', async () => {
      const imgEvidence = await evidenceRepo.create({
        fileName: 'missing_file.jpg',
        fileType: 'IMAGE',
        mimeType: 'image/jpeg',
        sizeBytes: 8192,
        storageUrl: '/uploads/evidence/missing_file.jpg',
        status: 'PENDING',
        uploadedByUserId: 'usr-missing-bytes',
      });

      const headers = await createAuthHeaders('usr-missing-bytes', 'FIELD_OFFICER');
      const req = new NextRequest('http://localhost:3000/api/v1/vision/analyze', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evidenceId: imgEvidence.id,
          modelTask: 'road_damage',
        }),
      });

      const res = await analyzeVisionRoute(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('BAD_REQUEST');
      expect(json.error.message).toContain('image bytes could not be loaded');
    });
  });
});
