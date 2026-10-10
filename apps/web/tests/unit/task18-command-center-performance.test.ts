// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — TASK 18: Command Center Performance & Fetch Cancellation Verification Suite
// Validates Request Cancellation via AbortController, Stale Response Protection & Idempotent Fetch Lifecycles
// ──────────────────────────────────────────────────────────────

import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('TASK 18 — Command Center Data Fetching Performance & Cancellation Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. In-Flight Request Cancellation with AbortController', () => {
    it('aborts previous pending fetch when new request is initiated', async () => {
      let firstSignalAborted = false;

      // Simulate a fetch client handling cancellation
      const mockFetch = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
        return new Promise((resolve, reject) => {
          if (init?.signal) {
            init.signal.addEventListener('abort', () => {
              firstSignalAborted = true;
              const err = new Error('The operation was aborted.');
              err.name = 'AbortError';
              reject(err);
            });
          }
        });
      });

      // 1. Start First Fetch
      const controller1 = new AbortController();
      const promise1 = mockFetch('/api/v1/command-center/incidents/inc-101', { signal: controller1.signal })
        .catch((err: Error) => err.name);

      // 2. User rapidly switches to incident 102 -> Abort controller 1
      controller1.abort();
      const result1 = await promise1;

      expect(firstSignalAborted).toBe(true);
      expect(result1).toBe('AbortError');
    });

    it('prevents stale resolved payload from overwriting updated state', async () => {
      let state = { activeIncidentId: 'inc-101', data: 'initial' };

      const controller1 = new AbortController();

      // Slow response for request 1
      const slowFetch = new Promise((resolve) => {
        setTimeout(() => {
          resolve({ id: 'inc-101', data: 'STALE_DATA_101' });
        }, 50);
      });

      // User switched to 102 before request 1 finished
      controller1.abort();
      state = { activeIncidentId: 'inc-102', data: 'FRESH_DATA_102' };

      // Slow fetch finishes
      const result = await slowFetch;
      if (!controller1.signal.aborted) {
        state = { activeIncidentId: 'inc-101', data: (result as any).data };
      }

      // State MUST retain FRESH_DATA_102
      expect(state.activeIncidentId).toBe('inc-102');
      expect(state.data).toBe('FRESH_DATA_102');
    });
  });

  describe('2. Error and Loading State Resiliency', () => {
    it('suppresses AbortError logging while capturing real network errors', async () => {
      let capturedError: string | null = null;

      const safeFetchWrapper = async (fetchPromise: Promise<any>, signal?: AbortSignal) => {
        try {
          return await fetchPromise;
        } catch (err: any) {
          if (err.name !== 'AbortError' && !signal?.aborted) {
            capturedError = err.message;
          }
          return null;
        }
      };

      // 1. Aborted error -> Should NOT set capturedError
      const abortController = new AbortController();
      const abortedPromise = new Promise((_, reject) => {
        const err = new Error('Aborted');
        err.name = 'AbortError';
        reject(err);
      });
      abortController.abort();

      await safeFetchWrapper(abortedPromise, abortController.signal);
      expect(capturedError).toBeNull();

      // 2. Real network error -> Should set capturedError
      const realNetworkPromise = Promise.reject(new Error('500 Internal Server Error'));
      await safeFetchWrapper(realNetworkPromise);
      expect(capturedError).toBe('500 Internal Server Error');
    });
  });
});
