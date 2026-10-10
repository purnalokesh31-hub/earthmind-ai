# Server Repositories Layer (`lib/server/repositories`)

## Responsibility
The `repositories` module implements the **Repository Pattern**, encapsulating data persistence logic and isolating business domain services from underlying ORM queries or database schemas.

## Key Principles
- **Abstraction**: Services interact strictly with repository interfaces (`IBaseRepository<T>`, `IIncidentRepository`).
- **Testability**: Allows mock repositories to be injected easily in unit and integration tests.
- **Decoupling**: Database schema changes only impact the repository implementation layer, leaving domain business logic untouched.
