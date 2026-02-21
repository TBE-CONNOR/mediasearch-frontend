import { QueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: (failureCount, error) => {
        if (isAxiosError(error) && error.response) {
          const status = error.response.status;
          // 429 (rate limit) is retryable — let retryDelay handle backoff
          if (status === 429) return failureCount < 3;
          // All other 4xx client errors (auth, validation) are never retryable
          if (status >= 400 && status < 500) return false;
        }
        // Network errors (no response) and 5xx server errors get up to 2 retries
        return failureCount < 2;
      },
      retryDelay: (attemptIndex, error) => {
        // Use longer backoff for rate-limit errors
        if (isAxiosError(error) && error.response?.status === 429) {
          return Math.min(2000 * 2 ** attemptIndex, 15_000);
        }
        return Math.min(1000 * 2 ** attemptIndex, 10_000);
      },
    },
    mutations: {
      retry: false,
    },
  },
});
