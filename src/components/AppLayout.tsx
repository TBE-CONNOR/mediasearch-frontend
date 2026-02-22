import { Outlet } from 'react-router';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Skip to main content
      </a>
      <NavBar />
      <main id="main-content" className="relative flex flex-1 flex-col pt-16 sm:pt-[4.5rem]">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
