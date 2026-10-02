'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 2, // 2 minutes: instant cached renders on back/forward navigation
            gcTime: 1000 * 60 * 10, // 10 minutes: keep inactive query caches in memory
            refetchOnWindowFocus: false, // Prevent background refetch flashing when toggling tabs
            refetchOnReconnect: 'always',
            retry: (failureCount, error: any) => {
              // Do not retry 4xx client errors (401, 403, 404, 422)
              const status = error?.status || error?.statusCode;
              if (status >= 400 && status < 500) return false;
              return failureCount < 2;
            },
          },
          mutations: {
            retry: false, // Do not repeat non-idempotent mutations on failure
          },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
