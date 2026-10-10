// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Password Hashing Utilities via 'bcryptjs'
// ──────────────────────────────────────────────────────────────

import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, SALT_ROUNDS);
}

export async function comparePassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}
