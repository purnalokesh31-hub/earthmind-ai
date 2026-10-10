// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — IBaseRepository Interface
// Shared generic CRUD contract for all repositories.
// ──────────────────────────────────────────────────────────────

export interface IBaseRepository<T, ID = string> {
  findById(id: ID): Promise<T | null>;
  findAll(options?: FindAllOptions): Promise<T[]>;
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  update(id: ID, data: Partial<Omit<T, 'id' | 'createdAt'>>): Promise<T>;
  delete(id: ID): Promise<boolean>;
  count(): Promise<number>;
}

export interface FindAllOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDir?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
