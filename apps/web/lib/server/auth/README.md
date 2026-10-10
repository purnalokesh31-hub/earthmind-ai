# Server Auth & Security Layer (`lib/server/auth`)

## Responsibility
The `auth` module manages user authentication, JWT token issuance and verification, password hashing, and Role-Based Access Control (RBAC).

## Key Principles
- **Stateless Tokens**: Signs and verifies HMAC-SHA256 / RSA JWT tokens.
- **RBAC Matrix**: Enforces role hierarchy (`SUPERVISOR`, `COMMANDER`, `FIELD_OFFICER`, `ANALYST`, `SYSTEM_ADMIN`).
- **Security Best Practices**: Uses bcrypt/argon2 salt hashing for password credentials.
