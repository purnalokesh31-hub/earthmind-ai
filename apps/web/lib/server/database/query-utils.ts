// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Enterprise Reusable Query Utilities
// Standardized Prisma query builders for pagination, sorting, search, & filtering
// ──────────────────────────────────────────────────────────────

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  limit?: number;
  offset?: number;
}

export interface CursorPaginationParams {
  cursorId?: string;
  limit?: number;
}

export interface SortingParams {
  orderBy?: string;
  orderDir?: 'asc' | 'desc';
}

export interface DateRangeParams {
  from?: Date | string;
  to?: Date | string;
}

export interface IncidentFilterParams {
  status?: string | string[];
  severity?: string | string[];
  departmentId?: string;
  departmentName?: string;
  category?: string;
  createdById?: string;
  assignedOfficerId?: string;
  minRiskScore?: number;
  maxRiskScore?: number;
  from?: Date | string;
  to?: Date | string;
  search?: string;
}

// ── 1. Offset Pagination Utility ─────────────────────────────
export function buildPaginationQuery(params?: PaginationParams): { skip: number; take: number } {
  const page = Math.max(1, params?.page || 1);
  const pageSize = Math.min(100, Math.max(1, params?.pageSize || params?.limit || 20));
  const skip = params?.offset !== undefined ? params.offset : (page - 1) * pageSize;

  return { skip, take: pageSize };
}

// ── 2. Cursor-Based Pagination Utility ───────────────────────
export function buildCursorPaginationQuery(params?: CursorPaginationParams): {
  take: number;
  skip?: number;
  cursor?: { id: string };
} {
  const limit = Math.min(100, Math.max(1, params?.limit || 20));
  if (!params?.cursorId) {
    return { take: limit };
  }

  return {
    take: limit,
    skip: 1, // Skip the cursor item itself
    cursor: { id: params.cursorId },
  };
}

// ── 3. Sorting Query Builder ─────────────────────────────────
export function buildSortingQuery(
  params?: SortingParams,
  defaultField = 'createdAt',
  defaultDir: 'asc' | 'desc' = 'desc'
): Record<string, 'asc' | 'desc'> {
  const field = params?.orderBy || defaultField;
  const dir = params?.orderDir || defaultDir;
  return { [field]: dir };
}

// ── 4. Date Range Filter Builder ─────────────────────────────
export function buildDateRangeQuery(params?: DateRangeParams): { gte?: Date; lte?: Date } | undefined {
  if (!params?.from && !params?.to) return undefined;

  const filter: { gte?: Date; lte?: Date } = {};
  if (params.from) filter.gte = new Date(params.from);
  if (params.to) filter.lte = new Date(params.to);

  return filter;
}

// ── 5. Status Filter Builder ─────────────────────────────────
export function buildStatusFilter(status?: string | string[]): any {
  if (!status) return undefined;

  if (Array.isArray(status)) {
    return { in: status.map((s) => s.toUpperCase()) };
  }
  return status.toUpperCase();
}

// ── 6. Severity Filter Builder ───────────────────────────────
export function buildSeverityFilter(severity?: string | string[]): any {
  if (!severity) return undefined;

  if (Array.isArray(severity)) {
    return { in: severity.map((s) => s.toUpperCase()) };
  }
  return severity.toUpperCase();
}

// ── 7. Department Filter Builder ─────────────────────────────
export function buildDepartmentFilter(departmentId?: string, departmentName?: string): any {
  if (departmentId) return { departmentId };
  if (departmentName) return { department: { equals: departmentName, mode: 'insensitive' } };
  return undefined;
}

// ── 8. Multi-Field Text Search Query Builder ─────────────────
export function buildSearchQuery(search?: string, searchFields: string[] = ['title', 'description', 'locationName']): any {
  if (!search || !search.trim()) return undefined;

  const term = search.trim();
  return {
    OR: searchFields.map((field) => ({
      [field]: { contains: term, mode: 'insensitive' },
    })),
  };
}

// ── 9. Combined Incident Filter Builder ──────────────────────
export function buildIncidentQueryFilters(params?: IncidentFilterParams): any {
  if (!params) return { deletedAt: null };

  const where: any = { deletedAt: null };

  if (params.status) where.status = buildStatusFilter(params.status);
  if (params.severity) where.severity = buildSeverityFilter(params.severity);
  if (params.category) where.category = { equals: params.category, mode: 'insensitive' };
  if (params.createdById) where.createdById = params.createdById;
  if (params.assignedOfficerId) where.assignedOfficerId = params.assignedOfficerId;

  if (params.departmentId) where.departmentId = params.departmentId;
  else if (params.departmentName) where.department = { equals: params.departmentName, mode: 'insensitive' };

  if (params.minRiskScore !== undefined || params.maxRiskScore !== undefined) {
    where.riskScore = {};
    if (params.minRiskScore !== undefined) where.riskScore.gte = params.minRiskScore;
    if (params.maxRiskScore !== undefined) where.riskScore.lte = params.maxRiskScore;
  }

  const dateFilter = buildDateRangeQuery({ from: params.from, to: params.to });
  if (dateFilter) where.createdAt = dateFilter;

  const searchQuery = buildSearchQuery(params.search);
  if (searchQuery) where.OR = searchQuery.OR;

  return where;
}
