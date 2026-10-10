// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Enterprise Asynchronous Domain Event Bus
// Decouples event emitters from downstream processing subscribers
// ──────────────────────────────────────────────────────────────

import { BaseDomainEvent, DomainEventName } from './event.types';
import { logger } from '../logger';

export type EventHandler<T = any> = (event: BaseDomainEvent<T>) => Promise<void> | void;

export interface IEventBus {
  publish<T>(eventType: DomainEventName, payload: T, traceId?: string): Promise<void>;
  subscribe<T>(eventType: DomainEventName, handler: EventHandler<T>): () => void;
  clearAll(): void;
}

export class InMemoryEventBus implements IEventBus {
  private readonly listeners = new Map<DomainEventName, Set<EventHandler>>();

  async publish<T>(eventType: DomainEventName, payload: T, traceId?: string): Promise<void> {
    const event: BaseDomainEvent<T> = {
      eventId: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      eventType,
      timestamp: new Date().toISOString(),
      traceId,
      payload,
    };

    const handlers = this.listeners.get(eventType);
    if (!handlers || handlers.size === 0) {
      return;
    }

    logger.info(`[EventBus] Publishing ${eventType}`, {
      eventId: event.eventId,
      eventType,
      traceId,
      subscriberCount: handlers.size,
    });

    // Execute subscribers asynchronously with isolated error boundaries
    const executions = Array.from(handlers).map(async (handler) => {
      try {
        await handler(event);
      } catch (err: unknown) {
        logger.error(`[EventBus Error] Subscriber failed on ${eventType}`, err, {
          eventId: event.eventId,
          eventType,
        });
      }
    });

    await Promise.allSettled(executions);
  }

  subscribe<T>(eventType: DomainEventName, handler: EventHandler<T>): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }

    const handlers = this.listeners.get(eventType)!;
    handlers.add(handler);

    // Unsubscribe callback
    return () => {
      handlers.delete(handler);
    };
  }

  clearAll(): void {
    this.listeners.clear();
  }
}

export const eventBus = new InMemoryEventBus();
export default eventBus;
