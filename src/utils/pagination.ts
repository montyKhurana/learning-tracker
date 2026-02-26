/**
 * Cursor-Based Pagination Utilities — Phase 6
 *
 * Implements Relay-style cursor-based pagination.
 *
 * Cursor strategy: Base64-encoded `createdAt` timestamp with a "cursor::" prefix
 * for validation. UUIDs aren't sequential, so createdAt provides natural ordering.
 *
 * Key concept: We fetch N+1 items to determine `hasNextPage` without an extra query.
 * If we get back more items than requested, there's another page.
 */

// ============================================================
// Interfaces
// ============================================================

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

export interface Edge<T> {
  cursor: string;
  node: T;
}

export interface Connection<T> {
  edges: Edge<T>[];
  pageInfo: PageInfo;
  totalCount: number;
}

export interface PaginationArgs {
  first?: number | null;
  after?: string | null;
}

// ============================================================
// Cursor encoding/decoding
// ============================================================

const CURSOR_PREFIX = 'cursor::';

export function encodeCursor(createdAt: Date): string {
  return Buffer.from(`${CURSOR_PREFIX}${createdAt.toISOString()}`).toString('base64');
}

export function decodeCursor(cursor: string): Date {
  const decoded = Buffer.from(cursor, 'base64').toString('utf-8');

  if (!decoded.startsWith(CURSOR_PREFIX)) {
    throw new Error('Invalid cursor format');
  }

  const dateStr = decoded.slice(CURSOR_PREFIX.length);
  const date = new Date(dateStr);

  if (isNaN(date.getTime())) {
    throw new Error('Invalid cursor: bad date');
  }

  return date;
}

// ============================================================
// Helpers
// ============================================================

/**
 * Clamp `first` to a sensible range: default 20, max 100.
 */
export function clampFirst(first?: number | null): number {
  if (first == null) return 20;
  if (first < 1) return 1;
  if (first > 100) return 100;
  return first;
}

/**
 * Build a Relay-style connection object from a list of items.
 *
 * Expects `items` fetched with `take: first + 1` (the N+1 trick).
 * If items.length > first, we know there's a next page and we slice off the extra.
 */
export function buildConnection<T extends { createdAt: Date }>(
  items: T[],
  first: number,
  totalCount: number,
  hasPreviousPage: boolean,
): Connection<T> {
  const hasNextPage = items.length > first;
  const nodes = hasNextPage ? items.slice(0, first) : items;

  const edges: Edge<T>[] = nodes.map((node) => ({
    cursor: encodeCursor(node.createdAt),
    node,
  }));

  return {
    edges,
    pageInfo: {
      hasNextPage,
      hasPreviousPage,
      startCursor: edges.length > 0 ? edges[0].cursor : null,
      endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
    },
    totalCount,
  };
}
