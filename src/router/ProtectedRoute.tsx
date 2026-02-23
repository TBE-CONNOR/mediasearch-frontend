import { useEffect, useRef, useSyncExternalStore } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuthStore } from '@/store/authStore';
import { refreshSession } from '@/auth/refreshSession';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { TOKEN_REFRESH_BUFFER_MS } from '@/config/constants';

// Check token expiration every 30s. The subscribe/getSnapshot pattern
// satisfies React's purity rules (Date.now() is not called during render).
const TOKEN_CHECK_INTERVAL = 30_000;
let currentTimestamp = Date.now();
function subscribeToTime(cb: () => void) {
  const id = setInterval(() => { currentTimestamp = Date.now(); cb(); }, TOKEN_CHECK_INTERVAL);
  return () => clearInterval(id);
}
function getTimestamp() { return currentTimestamp; }

export function ProtectedRoute() {
  const idToken = useAuthStore((s) => s.idToken);
  const expiresAt = useAuthStore((s) => s.expiresAt);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const authReady = useAuthStore((s) => s.authReady);
  const location = useLocation();
  const now = useSyncExternalStore(subscribeToTime, getTimestamp);
  const refreshingRef = useRef(false);

  const expired = !idToken || !expiresAt || expiresAt - TOKEN_REFRESH_BUFFER_MS <= now;

  // Attempt silent token refresh before forcing sign-in redirect
  useEffect(() => {
    if (expired && refreshToken && !refreshingRef.current) {
      refreshingRef.current = true;
      void refreshSession().finally(() => {
        refreshingRef.current = false;
      });
    }
  }, [expired, refreshToken]);

  if (!authReady) return <LoadingSpinner />;

  // Expired but has refresh token — show spinner while refresh attempt runs
  if (expired && refreshToken) return <LoadingSpinner />;

  // Fully expired, no recovery possible — redirect to sign-in
  if (expired)
    return (
      <Navigate
        to="/sign-in"
        state={{ from: location.pathname + location.search + location.hash }}
        replace
      />
    );

  return <Outlet />;
}
