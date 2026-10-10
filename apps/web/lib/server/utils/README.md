# Server Utils Layer (`lib/server/utils`)

## Responsibility
The `utils` module contains pure helper functions, string formatters, ID generators, and date parsers strictly scoped to the server runtime environment.

## Key Principles
- **Side-Effect Free**: Pure functions with zero side-effects.
- **Server Scoped**: Utilized exclusively by backend services, repositories, and middleware.
