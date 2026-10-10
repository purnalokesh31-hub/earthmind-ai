# Server Cache Layer (`lib/server/cache`)

## Responsibility
The `cache` module abstracts caching strategies (Redis / In-Memory key-value store) for fast telemetry lookups, rate limiting counters, and session token caching.

## Key Principles
- **Driver Abstraction**: Supports seamless switching between Redis cluster and memory cache drivers.
- **TTL Support**: Automatically expires cached entries based on key Time-To-Live settings.
- **Circuit Breaker**: Degrades gracefully if cache backend goes offline.
