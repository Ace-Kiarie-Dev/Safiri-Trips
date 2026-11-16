import { QueryClient } from '@tanstack/react-query';

/** Persistence and stale fallback live in lib/cache (SQLite), so the in-memory layer stays simple. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false },
  },
});
