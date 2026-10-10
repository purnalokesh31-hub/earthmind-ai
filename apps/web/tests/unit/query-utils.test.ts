import { describe, it, expect } from 'vitest';
import {
  buildPaginationQuery,
  buildCursorPaginationQuery,
  buildSortingQuery,
  buildDateRangeQuery,
  buildStatusFilter,
  buildSeverityFilter,
  buildSearchQuery,
  buildIncidentQueryFilters,
} from '../../lib/server/database/query-utils';

describe('Phase 6.2.8 — Query Utilities Verification', () => {
  it('should build offset pagination query params', () => {
    const page1 = buildPaginationQuery({ page: 1, pageSize: 20 });
    expect(page1).toEqual({ skip: 0, take: 20 });

    const page3 = buildPaginationQuery({ page: 3, pageSize: 15 });
    expect(page3).toEqual({ skip: 30, take: 15 });
  });

  it('should build cursor-based pagination query params', () => {
    const initial = buildCursorPaginationQuery({ limit: 10 });
    expect(initial).toEqual({ take: 10 });

    const next = buildCursorPaginationQuery({ cursorId: 'INC-cur-99', limit: 10 });
    expect(next).toEqual({ take: 10, skip: 1, cursor: { id: 'INC-cur-99' } });
  });

  it('should build sorting query object', () => {
    const sortAsc = buildSortingQuery({ orderBy: 'title', orderDir: 'asc' });
    expect(sortAsc).toEqual({ title: 'asc' });

    const defaultSort = buildSortingQuery();
    expect(defaultSort).toEqual({ createdAt: 'desc' });
  });

  it('should build date range query filters', () => {
    const from = new Date('2026-08-01');
    const to = new Date('2026-08-06');
    const dateRange = buildDateRangeQuery({ from, to });
    expect(dateRange?.gte).toEqual(from);
    expect(dateRange?.lte).toEqual(to);
  });

  it('should build status and severity enum filters', () => {
    expect(buildStatusFilter('active')).toBe('ACTIVE');
    expect(buildStatusFilter(['active', 'dispatched'])).toEqual({ in: ['ACTIVE', 'DISPATCHED'] });

    expect(buildSeverityFilter('critical')).toBe('CRITICAL');
    expect(buildSeverityFilter(['critical', 'high'])).toEqual({ in: ['CRITICAL', 'HIGH'] });
  });

  it('should build multi-field text search query', () => {
    const search = buildSearchQuery('Benz Circle');
    expect(search.OR).toHaveLength(3);
    expect(search.OR[0]).toEqual({ title: { contains: 'Benz Circle', mode: 'insensitive' } });
  });

  it('should combine all filter params into unified incident where clause', () => {
    const where = buildIncidentQueryFilters({
      status: 'active',
      severity: ['critical', 'high'],
      minRiskScore: 70,
      search: 'subsidence',
    });

    expect(where.deletedAt).toBeNull();
    expect(where.status).toBe('ACTIVE');
    expect(where.severity).toEqual({ in: ['CRITICAL', 'HIGH'] });
    expect(where.riskScore).toEqual({ gte: 70 });
    expect(where.OR).toBeDefined();
  });
});
