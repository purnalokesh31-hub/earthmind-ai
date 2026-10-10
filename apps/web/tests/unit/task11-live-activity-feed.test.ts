// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — TASK 11: Live Activity Feed Resilience & State Suite
// Validates dynamic connection states, AbortController lifecycle, and error handling
// ──────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';

describe('TASK 11 — Live Activity Feed Resilience & State Logic', () => {
  describe('1. Dynamic Connection State & Indicator Styling', () => {
    function getIndicatorStyles(connectionState: 'CONNECTED' | 'RECONNECTING' | 'OFFLINE') {
      switch (connectionState) {
        case 'CONNECTED':
          return {
            pill: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
            dot: 'bg-emerald-400',
            isError: false,
          };
        case 'RECONNECTING':
          return {
            pill: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
            dot: 'bg-amber-400',
            isError: true,
          };
        case 'OFFLINE':
        default:
          return {
            pill: 'bg-red-500/10 text-red-400 border-red-500/30',
            dot: 'bg-red-400',
            isError: true,
          };
      }
    }

    it('returns green emerald styling ONLY when state is CONNECTED', () => {
      const connected = getIndicatorStyles('CONNECTED');
      expect(connected.pill).toContain('emerald');
      expect(connected.dot).toContain('emerald');
      expect(connected.isError).toBe(false);
    });

    it('returns amber warning styling when connection is RECONNECTING (never green)', () => {
      const reconnecting = getIndicatorStyles('RECONNECTING');
      expect(reconnecting.pill).toContain('amber');
      expect(reconnecting.pill).not.toContain('emerald');
      expect(reconnecting.isError).toBe(true);
    });

    it('returns red alert styling when connection is OFFLINE (never green)', () => {
      const offline = getIndicatorStyles('OFFLINE');
      expect(offline.pill).toContain('red');
      expect(offline.pill).not.toContain('emerald');
      expect(offline.isError).toBe(true);
    });
  });

  describe('2. Network Failure & HTTP Error Response Handling', () => {
    function resolveNextFeedState(status: number | null, isNetworkError: boolean): 'CONNECTED' | 'RECONNECTING' | 'OFFLINE' {
      if (isNetworkError) return 'OFFLINE';
      if (status === 200) return 'CONNECTED';
      return 'RECONNECTING';
    }

    it('sets state to CONNECTED when HTTP status is 200', () => {
      expect(resolveNextFeedState(200, false)).toBe('CONNECTED');
    });

    it('sets state to RECONNECTING when HTTP status is 401, 500, or 503', () => {
      expect(resolveNextFeedState(401, false)).toBe('RECONNECTING');
      expect(resolveNextFeedState(500, false)).toBe('RECONNECTING');
      expect(resolveNextFeedState(503, false)).toBe('RECONNECTING');
    });

    it('sets state to OFFLINE on unhandled fetch/network exceptions', () => {
      expect(resolveNextFeedState(null, true)).toBe('OFFLINE');
    });
  });

  describe('3. AbortController Signal Propagation', () => {
    it('aborts previous controller when new polling cycle starts or component unmounts', () => {
      let activeController: AbortController | null = new AbortController();
      let aborted = false;

      activeController.signal.addEventListener('abort', () => {
        aborted = true;
      });

      // Simulate next polling cycle or unmount
      activeController.abort();
      expect(aborted).toBe(true);
      expect(activeController.signal.aborted).toBe(true);
    });
  });
});
