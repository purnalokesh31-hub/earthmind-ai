// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — AES-256-GCM Envelope Encryption Service
// ──────────────────────────────────────────────────────────────

import crypto from 'crypto';
import { IKmsProvider, LocalKmsProvider } from './kms.interface';
import { logger } from '../logger';

export interface EncryptedPayload {
  cipherText: Buffer;
  iv: Buffer;
  authTag: Buffer;
  encryptedDataKey: Buffer;
}

export class EncryptionService {
  constructor(private readonly kms: IKmsProvider = new LocalKmsProvider()) {}

  async encryptBuffer(data: Buffer): Promise<EncryptedPayload> {
    const { cipherTextKey, plainTextKey } = await this.kms.generateDataKey();
    const iv = crypto.randomBytes(12);

    const cipher = crypto.createCipheriv('aes-256-gcm', plainTextKey, iv);
    const cipherText = Buffer.concat([cipher.update(data), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return {
      cipherText,
      iv,
      authTag,
      encryptedDataKey: cipherTextKey,
    };
  }

  async decryptBuffer(payload: EncryptedPayload): Promise<Buffer> {
    const plainTextKey = await this.kms.decryptDataKey(payload.encryptedDataKey);
    const decipher = crypto.createDecipheriv('aes-256-gcm', plainTextKey, payload.iv);
    decipher.setAuthTag(payload.authTag);

    const decrypted = Buffer.concat([decipher.update(payload.cipherText), decipher.final()]);
    return decrypted;
  }
}

export const encryptionService = new EncryptionService();
