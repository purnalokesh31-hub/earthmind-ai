// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Centralized JWT & Security Configuration
// ──────────────────────────────────────────────────────────────

import envConfig from './env.config';

export interface JwtConfig {
  secret: string;
  expiresIn: string;
  refreshSecret: string;
  refreshExpiresIn: string;
  algorithm: 'HS256' | 'RS256';
  issuer: string;
  audience: string;
}

export const jwtConfig: JwtConfig = {
  secret: envConfig.JWT_SECRET,
  expiresIn: envConfig.JWT_EXPIRES_IN,
  refreshSecret: envConfig.JWT_REFRESH_SECRET,
  refreshExpiresIn: envConfig.JWT_REFRESH_EXPIRES_IN,
  algorithm: 'HS256',
  issuer: 'earthmind-pios-auth-service',
  audience: 'earthmind-pios-web-client',
};

export default jwtConfig;
