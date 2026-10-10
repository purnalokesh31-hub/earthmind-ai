// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Enterprise CDN Abstraction & Signed URL Service
// ──────────────────────────────────────────────────────────────

import { logger } from '../logger';

export interface ICdnProvider {
  generateSignedUrl(fileKey: string, ttlSeconds?: number): Promise<string>;
}

export class LocalCdnProvider implements ICdnProvider {
  async generateSignedUrl(fileKey: string, ttlSeconds = 900): Promise<string> {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    const signature = Buffer.from(`${fileKey}:${expiresAt}`).toString('base64url').slice(0, 16);
    return `/cdn/${fileKey}?expires=${expiresAt}&signature=${signature}`;
  }
}

export class CdnService {
  constructor(private readonly provider: ICdnProvider = new LocalCdnProvider()) {}

  async getSignedUrl(fileKey: string, ttlSeconds = 900): Promise<string> {
    const signedUrl = await this.provider.generateSignedUrl(fileKey, ttlSeconds);
    logger.info(`[CdnService] Issued signed CDN URL for asset '${fileKey}' (TTL: ${ttlSeconds}s)`);
    return signedUrl;
  }
}

export const cdnService = new CdnService();
