// ──────────────────────────────────────────────────────────────
// EarthMind PIOS v1.0 — Centralized Design Token System
// ──────────────────────────────────────────────────────────────

export const COLORS = {
  base: '#050B14',
  surface: {
    0: '#050B14',
    1: '#0d1117',
    2: '#0A1220',
    3: '#142036',
    4: '#1e2b45',
  },
  earth: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
    950: '#022c22',
  },
  accent: {
    cyan: '#06b6d4',
    cyanHover: '#22d3ee',
    emerald: '#10b981',
    emeraldHover: '#34d399',
    rose: '#f43f5e',
    amber: '#f59e0b',
    violet: '#8b5cf6',
  },
  border: {
    subtle: 'rgba(255, 255, 255, 0.08)',
    hover: 'rgba(255, 255, 255, 0.15)',
    focus: 'rgba(6, 182, 212, 0.5)',
  },
  text: {
    primary: '#cbd5e1',
    secondary: '#94a3b8',
    muted: '#64748b',
    highlight: '#f8fafc',
  },
} as const;

export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
  '3xl': '48px',
} as const;

export const TYPOGRAPHY = {
  fontFamily: {
    sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
    mono: ['Space Mono', 'JetBrains Mono', 'monospace'],
  },
  fontSize: {
    '2xs': '8px',
    xs: '10px',
    sm: '12px',
    base: '14px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px',
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 900,
  },
} as const;

export const SHADOWS = {
  elevation: {
    1: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
    2: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
  },
  glow: {
    sm: '0 0 10px rgba(6, 182, 212, 0.15)',
    md: '0 0 20px rgba(6, 182, 212, 0.25)',
    lg: '0 0 30px rgba(6, 182, 212, 0.35)',
    emerald: '0 0 15px rgba(16, 185, 129, 0.25)',
    rose: '0 0 15px rgba(244, 63, 94, 0.25)',
  },
} as const;

export const RADIUS = {
  sm: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  full: '9999px',
} as const;

export const TRANSITIONS = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  normal: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  spring: '300ms cubic-bezier(0.16, 1, 0.3, 1)',
} as const;

export const ANIMATIONS = {
  scan: 'scan 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  pulseSlow: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  float: 'float 6s ease-in-out infinite',
} as const;

export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export const CONTAINER_WIDTHS = {
  maxContent: '1200px',
  sidebar: '220px',
  sidebarCollapsed: '60px',
  contextPanel: '320px',
} as const;

export const ICON_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
} as const;

export const BUTTON_SIZES = {
  sm: 'px-2.5 py-1 text-[10px] gap-1.5',
  md: 'px-3.5 py-1.5 text-xs gap-2',
  lg: 'px-5 py-2.5 text-sm gap-2.5',
} as const;

export const INPUT_SIZES = {
  sm: 'px-2.5 py-1 text-[10px]',
  md: 'px-3 py-2 text-xs',
  lg: 'px-4 py-3 text-sm',
} as const;

export const BADGE_COLORS = {
  neutral: 'bg-slate-900/80 text-slate-400 border-slate-700/50',
  info: 'bg-sky-950/60 text-sky-400 border-sky-800/60',
} as const;

export const SEVERITY_COLORS = {
  critical: {
    bg: 'bg-rose-950/60',
    text: 'text-rose-400',
    border: 'border-rose-800/60',
    dot: 'bg-rose-500',
    shadow: 'shadow-[0_0_10px_rgba(244,63,94,0.2)]',
    hex: '#f43f5e',
  },
  high: {
    bg: 'bg-amber-950/60',
    text: 'text-amber-400',
    border: 'border-amber-800/60',
    dot: 'bg-amber-500',
    shadow: 'shadow-[0_0_10px_rgba(251,191,36,0.15)]',
    hex: '#fbbf24',
  },
  medium: {
    bg: 'bg-amber-950/40',
    text: 'text-amber-300',
    border: 'border-amber-700/40',
    dot: 'bg-amber-400',
    hex: '#fcd34d',
  },
  low: {
    bg: 'bg-emerald-950/60',
    text: 'text-emerald-400',
    border: 'border-emerald-800/60',
    dot: 'bg-emerald-500',
    shadow: 'shadow-[0_0_10px_rgba(16,185,129,0.15)]',
    hex: '#10b981',
  },
} as const;

export const HEALTH_SCORE_COLORS = {
  Forest: { bg: 'bg-emerald-500', hex: '#10b981' },
  Water: { bg: 'bg-blue-500', hex: '#3b82f6' },
  Air: { bg: 'bg-yellow-500', hex: '#eab308' },
  Energy: { bg: 'bg-orange-500', hex: '#f97316' },
  Urban: { bg: 'bg-slate-400', hex: '#94a3b8' },
} as const;

export const PLANET_HEALTH_COLORS = {
  optimal: '#10b981',
  warning: '#f59e0b',
  critical: '#f43f5e',
} as const;

// Backward Compatibility Token Export
export const TOKENS = {
  colors: COLORS,
  spacing: SPACING,
  typography: TYPOGRAPHY,
  shadows: SHADOWS,
  radius: RADIUS,
  transitions: TRANSITIONS,
  animations: ANIMATIONS,
  breakpoints: BREAKPOINTS,
  containerWidths: CONTAINER_WIDTHS,
  iconSizes: ICON_SIZES,
  buttonSizes: BUTTON_SIZES,
  inputSizes: INPUT_SIZES,
  badgeColors: BADGE_COLORS,
  severityColors: SEVERITY_COLORS,
  healthScoreColors: HEALTH_SCORE_COLORS,
  planetHealthColors: PLANET_HEALTH_COLORS,
};

export default TOKENS;
