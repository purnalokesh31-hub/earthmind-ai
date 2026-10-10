# Server Middleware Layer (`lib/server/middleware`)

## Responsibility
The `middleware` module provides higher-order API wrappers and request pipeline guards for Next.js API Routes.

## Key Principles
- **Centralized Error Handling**: Catches exceptions and maps them to standardized HTTP JSON responses (`{ success: false, error: ... }`).
- **CORS & Rate Limiting**: Secures endpoints against malicious request spikes.
- **Context Injection**: Injects authenticated user context and request trace IDs into route handlers.
