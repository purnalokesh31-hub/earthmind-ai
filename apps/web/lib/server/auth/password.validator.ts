// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Password Policy & Strength Validator
// Enforces enterprise complexity rules (length, casing, digits, special chars)
// ──────────────────────────────────────────────────────────────

export interface PasswordValidationResult {
  isValid: boolean;
  score: number; // 0 to 100
  errors: string[];
}

export class PasswordValidator {
  private static readonly MIN_LENGTH = 8;
  private static readonly MAX_LENGTH = 128;

  static validate(password: string): PasswordValidationResult {
    const errors: string[] = [];
    let score = 0;

    if (!password) {
      return { isValid: false, score: 0, errors: ['Password cannot be empty'] };
    }

    // 1. Length Check
    if (password.length < this.MIN_LENGTH) {
      errors.push(`Password must be at least ${this.MIN_LENGTH} characters long`);
    } else {
      score += 25;
    }

    if (password.length > this.MAX_LENGTH) {
      errors.push(`Password cannot exceed ${this.MAX_LENGTH} characters`);
    }

    // 2. Uppercase Letter Check
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter (A-Z)');
    } else {
      score += 25;
    }

    // 3. Lowercase Letter Check
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter (a-z)');
    } else {
      score += 20;
    }

    // 4. Number Check
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one numeric digit (0-9)');
    } else {
      score += 15;
    }

    // 5. Special Character Check
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character (!@#$%^&*)');
    } else {
      score += 15;
    }

    return {
      isValid: errors.length === 0,
      score: Math.min(100, score),
      errors,
    };
  }
}
