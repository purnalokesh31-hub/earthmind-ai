// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Enterprise Distributed Event Bus & Adapter System
// Supports Domain Events, Integration Events, & Cloud Messaging Adapters
// ──────────────────────────────────────────────────────────────

import { logger } from '../logger';

export interface BaseEvent<T = unknown> {
  eventId: string;
  eventType: string;
  idempotencyKey: string;
  payload: T;
  timestamp: Date;
  source: string;
}

export type EventHandler<T = unknown> = (event: BaseEvent<T>) => Promise<void>;

export interface IEventBusAdapter {
  publish<T>(event: BaseEvent<T>): Promise<void>;
  subscribe<T>(eventType: string, handler: EventHandler<T>): void;
}

export class MemoryEventBusAdapter implements IEventBusAdapter {
  private handlers: Map<string, EventHandler<any>[]> = new Map();

  async publish<T>(event: BaseEvent<T>): Promise<void> {
    logger.info(`[EventBus] Published event '${event.eventType}' (ID: ${event.eventId})`);
    const eventHandlers = this.handlers.get(event.eventType) || [];

    for (const handler of eventHandlers) {
      try {
        await handler(event);
      } catch (error: any) {
        logger.error(`[EventBus] Handler error for event '${event.eventType}':`, error);
        throw error;
      }
    }
  }

  subscribe<T>(eventType: string, handler: EventHandler<T>): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler as any);
  }
}

export class EventBus {
  private adapter: IEventBusAdapter;
  private processedIdempotencyKeys: Set<string> = new Set();

  constructor(adapter: IEventBusAdapter = new MemoryEventBusAdapter()) {
    this.adapter = adapter;
  }

  async publish<T>(eventType: string, payload: T, idempotencyKey?: string): Promise<BaseEvent<T>> {
    const key = idempotencyKey || `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    if (this.processedIdempotencyKeys.has(key)) {
      logger.warn(`[EventBus] Duplicate event blocked by idempotency key '${key}'`);
      throw new Error(`Duplicate event execution prevented for key '${key}'`);
    }

    const event: BaseEvent<T> = {
      eventId: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      eventType,
      idempotencyKey: key,
      payload,
      timestamp: new Date(),
      source: 'earthmind-pios-backend',
    };

    this.processedIdempotencyKeys.add(key);
    await this.adapter.publish(event);
    return event;
  }

  subscribe<T>(eventType: string, handler: EventHandler<T>): void {
    this.adapter.subscribe(eventType, handler);
  }
}

export const eventBus = new EventBus();
