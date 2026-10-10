// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Auth DTOs (Login, Register, Session)
// ──────────────────────────────────────────────────────────────

// ── Requests ──────────────────────────────────────────────────

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface RefreshTokenRequestDto {
  refreshToken: string;
}

export interface ChangePasswordRequestDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// ── Responses ─────────────────────────────────────────────────

export interface LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;      // seconds
  tokenType: 'Bearer';
  user: UserResponseDto;
}

export interface UserResponseDto {
  id: string;
  email: string;
  fullName: string;
  role: 'SYSTEM_ADMIN' | 'SUPERVISOR' | 'COMMANDER' | 'FIELD_OFFICER' | 'ANALYST';
  departmentId?: string;
  isActive: boolean;
  lastLoginAt?: string;   // ISO string (never raw Date)
  createdAt: string;
}

export interface SessionResponseDto {
  isValid: boolean;
  user: UserResponseDto | null;
  expiresAt?: string;
}

// ── Mapper: Entity → DTO ───────────────────────────────────────
export function toUserResponseDto(entity: any): UserResponseDto {
  return {
    id: entity.id,
    email: entity.email,
    fullName: entity.fullName,
    role: entity.role,
    departmentId: entity.departmentId,
    isActive: entity.isActive,
    lastLoginAt: entity.lastLoginAt?.toISOString(),
    createdAt: entity.createdAt?.toISOString?.() ?? new Date().toISOString(),
  };
}
