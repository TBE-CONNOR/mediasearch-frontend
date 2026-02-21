import { Outlet } from 'react-router';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-[#09090b]">
      <NavBar />
      <main className="relative flex flex-1 flex-col pt-14 sm:pt-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
