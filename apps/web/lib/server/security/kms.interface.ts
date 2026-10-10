// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — KMS Provider Interface & Encryption Service
// ──────────────────────────────────────────────────────────────

import crypto from 'crypto';

export interface DataKeyPayload {
  cipherTextKey: Buffer;
  plainTextKey: Buffer;
}

export interface IKmsProvider {
  generateDataKey(keyId?: string): Promise<DataKeyPayload>;
  decryptDataKey(cipherTextKey: Buffer, keyId?: string): Promise<Buffer>;
}

export class LocalKmsProvider implements IKmsProvider {
  private masterKey = Buffer.from('earthmind-master-kms-key-32bytes!', 'utf8');

  async generateDataKey(): Promise<DataKeyPayload> {
    const plainTextKey = crypto.randomBytes(32);
    // Simple XOR cipher for mock envelope encryption in local dev
    const cipherTextKey = Buffer.alloc(32);
    for (let i = 0; i < 32; i++) {
      cipherTextKey[i] = plainTextKey[i] ^ this.masterKey[i % this.masterKey.length];
    }
    return { cipherTextKey, plainTextKey };
  }

  async decryptDataKey(cipherTextKey: Buffer): Promise<Buffer> {
    const plainTextKey = Buffer.alloc(cipherTextKey.length);
    for (let i = 0; i < cipherTextKey.length; i++) {
      plainTextKey[i] = cipherTextKey[i] ^ this.masterKey[i % this.masterKey.length];
    }
    return plainTextKey;
  }
}
