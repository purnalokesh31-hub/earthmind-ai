// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Middleware Auth Layer Proxy
// Delegates authentication & authorization calls to lib/server/auth
// ──────────────────────────────────────────────────────────────

export {
  authenticate as legacyAuthenticate,
  authorize,
  authorizePermission,
  optionalAuth,
  adminOnly,
  commanderOnly,
  fieldOfficerOnly,
} from '../auth/middleware.helpers';
