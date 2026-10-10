# Server Events Layer (`lib/server/events`)

## Responsibility
The `events` module manages the **Domain Event Bus** for asynchronous decoupled event handling across EarthMind PIOS.

## Key Principles
- **Event-Driven Architecture**: Decouples domain actions (e.g. `IncidentCreatedEvent`, `VisionInferenceCompletedEvent`) from side effects like notification dispatch or audit logging.
- **Pub/Sub Pattern**: Facilitates local event listeners and future RabbitMQ / Kafka message broker integration.
