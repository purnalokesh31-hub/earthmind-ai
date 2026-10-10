// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — TASK 10: Truthful UI Claims Verification Suite
// Validates no untruthful claims of city-wide synchronization, continuous streams for polling, or false persistence
// ──────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('TASK 10 — Truthful UI Claims Verification Suite', () => {
  const componentsDir = path.resolve(process.cwd(), 'components');

  function getFiles(dir: string, fileList: string[] = []): string[] {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        getFiles(filePath, fileList);
      } else if (/\.(tsx|jsx|ts|js)$/.test(file)) {
        fileList.push(filePath);
      }
    }
    return fileList;
  }

  it('verifies no component claims local state changes are "synced city-wide"', () => {
    const files = getFiles(componentsDir);
    const violatingFiles: string[] = [];

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      if (content.toLowerCase().includes('synced city-wide') || content.toLowerCase().includes('synced citywide')) {
        violatingFiles.push(path.basename(file));
      }
    }

    expect(violatingFiles).toEqual([]);
  });

  it('verifies LiveActivityFeed does not falsely claim continuous raw stream without specifying refresh interval', () => {
    const feedFile = path.join(componentsDir, 'command-center', 'LiveActivityFeed.tsx');
    const content = fs.readFileSync(feedFile, 'utf8');

    expect(content).not.toContain('⚡ Live Activity Telemetry Stream');
    expect(content).toContain('Live Activity Feed (5s Refresh)');
  });

  it('verifies NotificationStatusPanel accurately describes client-side notification state', () => {
    const notifFile = path.join(componentsDir, 'ui', 'NotificationStatusPanel.tsx');
    const content = fs.readFileSync(notifFile, 'utf8');

    expect(content).not.toContain('stream synced across all 9 domain workspaces');
    expect(content).toContain('Application event notifications managed in client state');
  });

  it('verifies HomePage does not claim satellite polling is a continuous live stream', () => {
    const homeFile = path.join(componentsDir, 'workspaces', 'HomePage.tsx');
    const content = fs.readFileSync(homeFile, 'utf8');

    expect(content).not.toContain('SENTINEL-2B STREAM');
    expect(content).toContain('SENTINEL-2B TELEMETRY');
  });
});
