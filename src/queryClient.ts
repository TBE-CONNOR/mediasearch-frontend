import { QueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: (failureCount, error) => {
        if (isAxiosError(error) && error.response) {
          const status = error.response.status;
          // Never retry 4xx client errors (auth, validation, quota)
          if (status >= 400 && status < 500) return false;
        }
        // Network errors (no response) and 5xx server errors get up to 2 retries
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
    },
  },
});
