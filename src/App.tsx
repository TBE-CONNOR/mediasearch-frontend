import { useEffect, lazy, Suspense } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { cognitoClient } from '@/auth/CognitoClient';
import { useAuthStore } from '@/store/authStore';
import { ProtectedRoute } from '@/router/ProtectedRoute';
import { AppLayout } from '@/components/AppLayout';
import { queryClient } from '@/config/queryClient';

const SignInPage = lazy(() =>
  import('@/pages/SignInPage').then((m) => ({ default: m.SignInPage })),
);
const SignUpPage = lazy(() =>
  import('@/pages/SignUpPage').then((m) => ({ default: m.SignUpPage })),
);
const ConfirmEmailPage = lazy(() =>
  import('@/pages/ConfirmEmailPage').then((m) => ({
    default: m.ConfirmEmailPage,
  })),
);
const DashboardPage = lazy(() =>
  import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const UploadPage = lazy(() =>
  import('@/pages/UploadPage').then((m) => ({ default: m.UploadPage })),
);
const FilesPage = lazy(() =>
  import('@/pages/FilesPage').then((m) => ({ default: m.FilesPage })),
);
const FileDetailPage = lazy(() =>
  import('@/pages/FileDetailPage').then((m) => ({
    default: m.FileDetailPage,
  })),
);
const SearchPage = lazy(() =>
  import('@/pages/SearchPage').then((m) => ({ default: m.SearchPage })),
);
const PricingPage = lazy(() =>
  import('@/pages/PricingPage').then((m) => ({ default: m.PricingPage })),
);
const SubscriptionPage = lazy(() =>
  import('@/pages/SubscriptionPage').then((m) => ({
    default: m.SubscriptionPage,
  })),
);
const LegalPage = lazy(() =>
  import('@/pages/LegalPage').then((m) => ({ default: m.LegalPage })),
);
const LandingPage = lazy(() =>
  import('@/pages/LandingPage').then((m) => ({ default: m.LandingPage })),
);

const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() =>
      import('@tanstack/react-query-devtools').then((m) => ({
        default: m.ReactQueryDevtools,
      })),
    )
  : () => null;

function AuthBootstrap({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    cognitoClient
      .restoreSession()
      .then((result) => {
        if (result && result.expiresAt > Date.now()) {
          useAuthStore.getState().setTokens({
            idToken: result.idToken,
            expiresAt: result.expiresAt,
            refreshToken: result.refreshToken,
          });
          useAuthStore.getState().setUser({
            email: result.email,
            sub: result.sub,
            tier: result.tier,
          });
        }
      })
      .catch((err: unknown) => {
        if (import.meta.env.DEV) console.warn('Session restore failed:', err);
      })
      .finally(() => useAuthStore.getState().setAuthReady(true));
  }, []);

  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <AuthBootstrap>
          <BrowserRouter>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/sign-in" element={<SignInPage />} />
                <Route path="/sign-up" element={<SignUpPage />} />
                <Route path="/confirm-email" element={<ConfirmEmailPage />} />
                <Route path="/legal" element={<LegalPage />} />
                <Route element={<ProtectedRoute />}>
                  <Route element={<AppLayout />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/upload" element={<UploadPage />} />
                    <Route path="/files" element={<FilesPage />} />
                    <Route
                      path="/files/:fileId"
                      element={<FileDetailPage />}
                    />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/pricing" element={<PricingPage />} />
                    <Route
                      path="/subscription"
                      element={<SubscriptionPage />}
                    />
                  </Route>
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthBootstrap>
      </ErrorBoundary>
      <Suspense fallback={null}>
        <ReactQueryDevtools initialIsOpen={false} />
      </Suspense>
    </QueryClientProvider>
  );
}
