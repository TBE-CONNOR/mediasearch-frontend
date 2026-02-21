import { useSyncExternalStore } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuthStore } from '@/store/authStore';
import { LoadingSpinner } from '@/components/LoadingSpinner';

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
  const authReady = useAuthStore((s) => s.authReady);
  const location = useLocation();
  const now = useSyncExternalStore(subscribeToTime, getTimestamp);

  if (!authReady) return <LoadingSpinner />;

  // Check both presence and expiration — expired tokens will 401 on API calls
  if (!idToken || !expiresAt || expiresAt <= now)
    return (
      <Navigate
        to="/sign-in"
        state={{ from: location.pathname + location.search + location.hash }}
        replace
      />
    );

  return <Outlet />;
}
