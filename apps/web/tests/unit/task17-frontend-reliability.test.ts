// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — TASK 17: Frontend Reliability & Notification Cleanup Verification Suite
// Validates Toast ID Consistency, Removal Accuracy, and Memory Leak Prevention
// ──────────────────────────────────────────────────────────────

import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '@/stores/app-store';

describe('TASK 17 — Frontend Reliability & Notification Cleanup Suite', () => {
  beforeEach(() => {
    // Clear toasts
    useAppStore.setState({ toasts: [] });
  });

  describe('1. Toast ID Consistency & Creation/Dismissal Integrity', () => {
    it('preserves caller-specified toast ID when provided', () => {
      const customId = 'toast-custom-evidence-sync-42';
      useAppStore.getState().addToast({
        id: customId,
        title: 'Evidence Synced',
        message: 'Telemetry data cached locally.',
        type: 'success',
      });

      const toasts = useAppStore.getState().toasts;
      expect(toasts.length).toBe(1);
      expect(toasts[0].id).toBe(customId);
      expect(toasts[0].title).toBe('Evidence Synced');
    });

    it('generates a unique prefixed ID when id is not provided', () => {
      useAppStore.getState().addToast({
        title: 'Network Warning',
        message: 'Reconnecting to sensor stream...',
        type: 'warning',
      });

      const toasts = useAppStore.getState().toasts;
      expect(toasts.length).toBe(1);
      expect(toasts[0].id).toMatch(/^toast-\d+-[a-z0-9]+$/);
    });

    it('removes the exact target toast by ID without affecting concurrent toasts', () => {
      useAppStore.getState().addToast({ id: 't-1', title: 'First Toast', type: 'info' });
      useAppStore.getState().addToast({ id: 't-2', title: 'Second Toast', type: 'error' });
      useAppStore.getState().addToast({ id: 't-3', title: 'Third Toast', type: 'success' });

      expect(useAppStore.getState().toasts.length).toBe(3);

      useAppStore.getState().removeToast('t-2');

      const remaining = useAppStore.getState().toasts;
      expect(remaining.length).toBe(2);
      expect(remaining.find((t) => t.id === 't-2')).toBeUndefined();
      expect(remaining.find((t) => t.id === 't-1')).toBeDefined();
      expect(remaining.find((t) => t.id === 't-3')).toBeDefined();
    });
  });

  describe('2. Multi-Notification Queue & Edge Case Handling', () => {
    it('handles rapid sequential toast creations with distinct IDs', () => {
      for (let i = 0; i < 10; i++) {
        useAppStore.getState().addToast({
          title: `Telemetry Event #${i}`,
          message: `Event processed for sensor ${i}`,
          type: 'info',
        });
      }

      const all = useAppStore.getState().toasts;
      expect(all.length).toBe(10);
      const uniqueIds = new Set(all.map((t) => t.id));
      expect(uniqueIds.size).toBe(10);
    });

    it('gracefully handles dismissal of already removed or non-existent toast ID', () => {
      useAppStore.getState().addToast({ id: 't-only', title: 'Single' });
      expect(useAppStore.getState().toasts.length).toBe(1);

      useAppStore.getState().removeToast('non-existent-id');
      expect(useAppStore.getState().toasts.length).toBe(1);

      useAppStore.getState().removeToast('t-only');
      expect(useAppStore.getState().toasts.length).toBe(0);

      // Duplicate removal call does not error
      expect(() => useAppStore.getState().removeToast('t-only')).not.toThrow();
    });
  });
});
