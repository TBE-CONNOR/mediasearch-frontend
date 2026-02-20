import { Outlet } from 'react-router';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <NavBar />
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
