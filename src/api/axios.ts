import axios, { isAxiosError } from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { AWS_CONFIG, TIER_API_KEYS } from '@/config/aws';
import { TOKEN_REFRESH_BUFFER_MS } from '@/config/constants';
import { cognitoClient } from '@/auth/CognitoClient';
import { useAuthStore } from '@/store/authStore';

export const api = axios.create({
  baseURL: AWS_CONFIG.apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
});

// Track configs that have already been retried (avoids untyped _retried mutation)
const retriedConfigs = new WeakSet<InternalAxiosRequestConfig>();

// Singleton refresh promise -- prevents concurrent requests from each
// firing their own Cognito refresh call.
let refreshPromise: Promise<{ idToken: string; expiresAt: number }> | null =
  null;

function doRefresh(): Promise<{ idToken: string; expiresAt: number }> {
  if (!refreshPromise) {
    const refreshToken = useAuthStore.getState().refreshToken;
    if (!refreshToken) {
      useAuthStore.getState().logout();
      return Promise.reject(new Error('No refresh token available'));
    }
    refreshPromise = cognitoClient
      .refresh(refreshToken)
      .then((t) => {
        useAuthStore.getState().setTokens(t);
        useAuthStore.getState().setUser({
          email: t.email,
          sub: t.sub,
          tier: t.tier,
        });
        return t;
      })
      .catch((err: unknown) => {
        // Refresh failed (e.g., token expired) -- force logout so
        // ProtectedRoute redirects to /sign-in.
        useAuthStore.getState().logout();
        throw err;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

api.interceptors.request.use(async (config) => {
  const { idToken, expiresAt, tier } = useAuthStore.getState();

  if (expiresAt && Date.now() > expiresAt - TOKEN_REFRESH_BUFFER_MS) {
    const fresh = await doRefresh();
    config.headers.Authorization = `Bearer ${fresh.idToken}`;
  } else {
    config.headers.Authorization = `Bearer ${idToken}`;
  }

  config.headers['x-api-key'] = TIER_API_KEYS[tier ?? 'free'];
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const config = err.config;
    if (err.response?.status === 401 && config && !retriedConfigs.has(config)) {
      retriedConfigs.add(config);
      // Clear stale singleton so doRefresh() starts a fresh attempt
      refreshPromise = null;
      try {
        const fresh = await doRefresh();
        config.headers.Authorization = `Bearer ${fresh.idToken}`;
        return api(config);
      } catch {
        // Refresh failed -- doRefresh already called logout()
        if (isAxiosError(err)) return Promise.reject(err);
        return Promise.reject(new Error('Token refresh failed'));
      }
    }
    if (isAxiosError(err)) return Promise.reject(err);
    return Promise.reject(new Error('Request failed'));
  },
);
