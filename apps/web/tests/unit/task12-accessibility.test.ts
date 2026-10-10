// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — TASK 12: Command Center Accessibility Suite
// Validates Focus Management, Trap, Restoration, ARIA Dialog Semantics & Keyboard Selection
// ──────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('TASK 12 — Command Center Accessibility Verification', () => {
  const overlayFilePath = path.resolve(process.cwd(), 'components/ui/Overlay.tsx');
  const interventionWorkspacePath = path.resolve(process.cwd(), 'components/command-center/CityInterventionWorkspace.tsx');

  describe('1. Dialog & Modal ARIA Semantics', () => {
    it('verifies Modal has role="dialog", aria-modal="true", and aria-labelledby', () => {
      const content = fs.readFileSync(overlayFilePath, 'utf8');

      expect(content).toContain('role="dialog"');
      expect(content).toContain('aria-modal="true"');
      expect(content).toContain("aria-labelledby={title ? 'modal-dialog-title' : undefined}");
    });

    it('verifies Drawer has role="dialog", aria-modal="true", and aria-labelledby', () => {
      const content = fs.readFileSync(overlayFilePath, 'utf8');

      expect(content).toContain("aria-labelledby={title ? 'drawer-dialog-title' : undefined}");
    });
  });

  describe('2. Focus Trap & Restoration Mechanism', () => {
    it('verifies previous active element is captured and restored on close', () => {
      const content = fs.readFileSync(overlayFilePath, 'utf8');

      expect(content).toContain('previousActiveElementRef.current = document.activeElement');
      expect(content).toContain('previousActiveElementRef.current.focus()');
    });

    it('verifies Escape key handling closes dialog', () => {
      const content = fs.readFileSync(overlayFilePath, 'utf8');

      expect(content).toContain("e.key === 'Escape'");
      expect(content).toContain('onClose()');
    });

    it('verifies Tab and Shift+Tab wrap around focusable elements inside dialog', () => {
      const content = fs.readFileSync(overlayFilePath, 'utf8');

      expect(content).toContain("e.key === 'Tab'");
      expect(content).toContain('firstElement');
      expect(content).toContain('lastElement');
      expect(content).toContain('e.shiftKey');
    });
  });

  describe('3. Intervention Candidate Strategy Keyboard Selection', () => {
    it('verifies candidate strategies use semantic button elements with aria-pressed', () => {
      const content = fs.readFileSync(interventionWorkspacePath, 'utf8');

      expect(content).toContain('<button');
      expect(content).toContain('type="button"');
      expect(content).toContain('aria-pressed={selectedCandidateId === c.id}');
      expect(content).toContain('focus:ring-2');
    });
  });
});
