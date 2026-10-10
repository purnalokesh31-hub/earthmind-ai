// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — IoC Application Container Implementation
// ──────────────────────────────────────────────────────────────

import { TOKENS, DIToken } from './tokens';

export class AppContainer {
  private static instance: AppContainer;
  private registry = new Map<symbol, any>();
  private factories = new Map<symbol, () => any>();

  private constructor() {}

  public static getInstance(): AppContainer {
    if (!AppContainer.instance) {
      AppContainer.instance = new AppContainer();
    }
    return AppContainer.instance;
  }

  public registerValue<T>(token: symbol, value: T): void {
    this.registry.set(token, value);
  }

  public registerFactory<T>(token: symbol, factory: () => T): void {
    this.factories.set(token, factory);
  }

  public resolve<T>(token: symbol): T {
    if (this.registry.has(token)) {
      return this.registry.get(token);
    }
    if (this.factories.has(token)) {
      const instance = this.factories.get(token)!();
      this.registry.set(token, instance); // Cache singleton
      return instance;
    }
    throw new Error(`[IoC Container] Dependency token '${token.toString()}' is not registered.`);
  }

  public reset(): void {
    this.registry.clear();
    this.factories.clear();
  }
}

export const container = AppContainer.getInstance();
export default container;
