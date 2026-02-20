import { Navigate, Outlet } from 'react-router';
import { useAuthStore } from '@/store/authStore';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export function ProtectedRoute() {
  const idToken = useAuthStore((s) => s.idToken);
  const authReady = useAuthStore((s) => s.authReady);

  if (!authReady) return <LoadingSpinner />;

  if (!idToken) return <Navigate to="/sign-in" replace />;

  return <Outlet />;
}
