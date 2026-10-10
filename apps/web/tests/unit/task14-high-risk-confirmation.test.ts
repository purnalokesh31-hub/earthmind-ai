// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — TASK 14: Secure High-Risk Confirmation Verification Suite
// Validates Missing, Invalid, Reused, and Valid Confirmation Tokens for High-Risk Actions
// ──────────────────────────────────────────────────────────────

import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as commandCaseApproveRoute } from '@/app/api/v1/digital-twin/command/cases/[id]/approve/route';
import { cityCommandDecisionService } from '@/lib/server/services/city-command-decision.service';
import { memoryCityCommandRepository } from '@/lib/server/repositories/city-command.repository';
import { JwtService } from '@/lib/server/auth/jwt.service';

describe('TASK 14 — Secure High-Risk Confirmation Flow', () => {
  const jwtService = new JwtService();
  let commanderToken: string;

  beforeEach(async () => {
    cityCommandDecisionService.resetConsumedTokens();

    commanderToken = await jwtService.generateAccessToken({
      sub: 'usr-commander-01',
      email: 'commander@earthmind.gov.in',
      role: 'COMMANDER',
      jti: 'jti-task14-test-01',
    });
  });

  describe('1. Rejection of Missing Confirmation Token', () => {
    it('rejects approval when confirmationToken is missing from payload', async () => {
      const caseEntity = memoryCityCommandRepository.createCase({
        title: 'Monsoon Flood Barrier Protocol',
        description: 'Emergency deployment',
        cityId: 'city-vja',
        sourceType: 'INTERVENTION_PLANNING',
        sourceReferenceId: 'ref-task14-test',
        riskScore: 94,
        riskTier: 'CRITICAL',
        confidenceScore: 90,
        confidenceLevel: 'HIGH_CONFIDENCE',
        requiredAuthorizationLevel: 'CITY_COMMANDER',
        recommendation: {
          recommendationId: 'rec-01',
          title: 'Deploy Flood Barrier',
          summary: 'Deploys mobile barrier units',
          targetId: 'zone-01',
          expectedRiskReductionDelta: 80,
          estimatedCostUsd: 10000,
          estimatedDurationHours: 2,
          requiresHumanApproval: true,
          provenance: 'INTERVENTION_PLANNING',
        },
      });

      const req = new NextRequest(`http://localhost:3000/api/v1/digital-twin/command/cases/${caseEntity.caseId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${commanderToken}`,
        },
        body: JSON.stringify({
          reason: 'Authorized barrier deployment due to surge.',
          // confirmationToken omitted
        }),
      });

      const res = await commandCaseApproveRoute(req, { params: Promise.resolve({ id: caseEntity.caseId }) });
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toContain('MISSING_CONFIRMATION_TOKEN');
    });

    it('rejects approval when confirmationToken is blank or whitespace', async () => {
      const caseEntity = memoryCityCommandRepository.createCase({
        title: 'Monsoon Flood Barrier Protocol',
        description: 'Emergency deployment',
        cityId: 'city-vja',
        sourceType: 'INTERVENTION_PLANNING',
        sourceReferenceId: 'ref-task14-test',
        riskScore: 94,
        riskTier: 'CRITICAL',
        confidenceScore: 90,
        confidenceLevel: 'HIGH_CONFIDENCE',
        requiredAuthorizationLevel: 'CITY_COMMANDER',
        recommendation: {
          recommendationId: 'rec-01',
          title: 'Deploy Flood Barrier',
          summary: 'Deploys mobile barrier units',
          targetId: 'zone-01',
          expectedRiskReductionDelta: 80,
          estimatedCostUsd: 10000,
          estimatedDurationHours: 2,
          requiresHumanApproval: true,
          provenance: 'INTERVENTION_PLANNING',
        },
      });

      const req = new NextRequest(`http://localhost:3000/api/v1/digital-twin/command/cases/${caseEntity.caseId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${commanderToken}`,
        },
        body: JSON.stringify({
          reason: 'Authorized barrier deployment.',
          confirmationToken: '   ',
        }),
      });

      const res = await commandCaseApproveRoute(req, { params: Promise.resolve({ id: caseEntity.caseId }) });
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.error).toContain('MISSING_CONFIRMATION_TOKEN');
    });
  });

  describe('2. Rejection of Invalid or Malformed Confirmation Token', () => {
    it('rejects approval when confirmationToken is too short or explicitly invalid', async () => {
      const caseEntity = memoryCityCommandRepository.createCase({
        title: 'Monsoon Flood Barrier Protocol',
        description: 'Emergency deployment',
        cityId: 'city-vja',
        sourceType: 'INTERVENTION_PLANNING',
        sourceReferenceId: 'ref-task14-test',
        riskScore: 94,
        riskTier: 'CRITICAL',
        confidenceScore: 90,
        confidenceLevel: 'HIGH_CONFIDENCE',
        requiredAuthorizationLevel: 'CITY_COMMANDER',
        recommendation: {
          recommendationId: 'rec-01',
          title: 'Deploy Flood Barrier',
          summary: 'Deploys mobile barrier units',
          targetId: 'zone-01',
          expectedRiskReductionDelta: 80,
          estimatedCostUsd: 10000,
          estimatedDurationHours: 2,
          requiresHumanApproval: true,
          provenance: 'INTERVENTION_PLANNING',
        },
      });

      const req = new NextRequest(`http://localhost:3000/api/v1/digital-twin/command/cases/${caseEntity.caseId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${commanderToken}`,
        },
        body: JSON.stringify({
          reason: 'Authorized barrier deployment.',
          confirmationToken: 'invalid',
        }),
      });

      const res = await commandCaseApproveRoute(req, { params: Promise.resolve({ id: caseEntity.caseId }) });
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.error).toContain('INVALID_CONFIRMATION_TOKEN');
    });
  });

  describe('3. Rejection of Reused Confirmation Token', () => {
    it('rejects replay attacks with previously consumed confirmation token', async () => {
      const caseEntity1 = memoryCityCommandRepository.createCase({
        title: 'First Protocol',
        description: 'Emergency deployment 1',
        cityId: 'city-vja',
        sourceType: 'INTERVENTION_PLANNING',
        sourceReferenceId: 'ref-task14-test',
        riskScore: 94,
        riskTier: 'CRITICAL',
        confidenceScore: 90,
        confidenceLevel: 'HIGH_CONFIDENCE',
        requiredAuthorizationLevel: 'CITY_COMMANDER',
        recommendation: {
          recommendationId: 'rec-01',
          title: 'Deploy Barrier 1',
          summary: 'Deploys units',
          targetId: 'zone-01',
          expectedRiskReductionDelta: 80,
          estimatedCostUsd: 10000,
          estimatedDurationHours: 2,
          requiresHumanApproval: true,
          provenance: 'INTERVENTION_PLANNING',
        },
      });

      const singleUseToken = 'CONFIRM-SINGLE-USE-TOKEN-9988';

      // First call -> Success
      const req1 = new NextRequest(`http://localhost:3000/api/v1/digital-twin/command/cases/${caseEntity1.caseId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${commanderToken}`,
        },
        body: JSON.stringify({
          reason: 'First valid authorization.',
          confirmationToken: singleUseToken,
        }),
      });

      const res1 = await commandCaseApproveRoute(req1, { params: Promise.resolve({ id: caseEntity1.caseId }) });
      expect(res1.status).toBe(200);

      // Create a second case to test token replay specifically
      const caseEntity2 = memoryCityCommandRepository.createCase({
        title: 'Second Protocol',
        description: 'Emergency deployment 2',
        cityId: 'city-vja',
        sourceType: 'INTERVENTION_PLANNING',
        sourceReferenceId: 'ref-task14-test',
        riskScore: 90,
        riskTier: 'CRITICAL',
        confidenceScore: 85,
        confidenceLevel: 'HIGH_CONFIDENCE',
        requiredAuthorizationLevel: 'CITY_COMMANDER',
        recommendation: {
          recommendationId: 'rec-02',
          title: 'Deploy Barrier 2',
          summary: 'Deploys units',
          targetId: 'zone-02',
          expectedRiskReductionDelta: 75,
          estimatedCostUsd: 8000,
          estimatedDurationHours: 2,
          requiresHumanApproval: true,
          provenance: 'INTERVENTION_PLANNING',
        },
      });

      // Second call using SAME token -> Must be rejected with CONFIRMATION_TOKEN_REUSED
      const req2 = new NextRequest(`http://localhost:3000/api/v1/digital-twin/command/cases/${caseEntity2.caseId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${commanderToken}`,
        },
        body: JSON.stringify({
          reason: 'Replay attempt with previously used token.',
          confirmationToken: singleUseToken,
        }),
      });

      const res2 = await commandCaseApproveRoute(req2, { params: Promise.resolve({ id: caseEntity2.caseId }) });
      expect(res2.status).toBe(400);

      const json2 = await res2.json();
      expect(json2.error).toContain('CONFIRMATION_TOKEN_REUSED');
    });
  });

  describe('4. Success on Valid Confirmation Token', () => {
    it('successfully approves command case when genuine, fresh confirmation token is provided', async () => {
      const caseEntity = memoryCityCommandRepository.createCase({
        title: 'Fresh Monsoon Barrier Protocol',
        description: 'Emergency barrier setup',
        cityId: 'city-vja',
        sourceType: 'INTERVENTION_PLANNING',
        sourceReferenceId: 'ref-task14-test',
        riskScore: 92,
        riskTier: 'CRITICAL',
        confidenceScore: 88,
        confidenceLevel: 'HIGH_CONFIDENCE',
        requiredAuthorizationLevel: 'CITY_COMMANDER',
        recommendation: {
          recommendationId: 'rec-03',
          title: 'Deploy Barrier 3',
          summary: 'Deploys units',
          targetId: 'zone-03',
          expectedRiskReductionDelta: 85,
          estimatedCostUsd: 12000,
          estimatedDurationHours: 2,
          requiresHumanApproval: true,
          provenance: 'INTERVENTION_PLANNING',
        },
      });

      const freshToken = 'CONFIRM-VALID-BARRIER-TOKEN-7788';

      const req = new NextRequest(`http://localhost:3000/api/v1/digital-twin/command/cases/${caseEntity.caseId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${commanderToken}`,
        },
        body: JSON.stringify({
          reason: 'Legitimate commander human authorization.',
          confirmationToken: freshToken,
          operatorNotes: 'Verified Doppler sensor radar inputs before barrier activation.',
        }),
      });

      const res = await commandCaseApproveRoute(req, { params: Promise.resolve({ id: caseEntity.caseId }) });
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.authorizationStatus).toBe('APPROVED_BY_HUMAN_OPERATOR');
      expect(json.case.status).toBe('APPROVED');
    });
  });
});
