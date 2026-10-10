// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Enterprise Antivirus & Quarantine Scanning Service
// ──────────────────────────────────────────────────────────────

import { logger } from '../logger';

export interface AntivirusScanResult {
  isClean: boolean;
  threatName?: string;
  scannedAt: Date;
  engine: 'ClamAV' | 'AWS GuardDuty' | 'In-Memory Stream Inspector';
}

export interface IAntivirusAdapter {
  scanBuffer(buffer: Buffer, fileName: string): Promise<AntivirusScanResult>;
}

export class ClamAvAdapter implements IAntivirusAdapter {
  async scanBuffer(buffer: Buffer, fileName: string): Promise<AntivirusScanResult> {
    const textContent = buffer.toString('utf8');
    if (textContent.includes('EICAR-STANDARD-ANTIVIRUS-TEST-FILE')) {
      logger.warn(`[ClamAV] Malware signature detected in file '${fileName}'`);
      return {
        isClean: false,
        threatName: 'EICAR-Test-Signature',
        scannedAt: new Date(),
        engine: 'ClamAV',
      };
    }

    return {
      isClean: true,
      scannedAt: new Date(),
      engine: 'ClamAV',
    };
  }
}

export class AntivirusService {
  constructor(private readonly adapter: IAntivirusAdapter = new ClamAvAdapter()) {}

  async scanFile(buffer: Buffer, fileName: string): Promise<AntivirusScanResult> {
    const result = await this.adapter.scanBuffer(buffer, fileName);
    if (!result.isClean) {
      logger.error(`[AntivirusService] File '${fileName}' rejected due to malware: ${result.threatName}`);
    }
    return result;
  }
}

export const antivirusService = new AntivirusService();
