'use client';

import '../globals.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Menu } from 'lucide-react';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        router.push('/login');
      } else {
        setUser(data.user);
        setLoading(false);
      }
    };

    checkSession();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) return <div className="p-6">Memuat...</div>;

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      {/* Hamburger for Mobile */}
      <div className="md:hidden flex items-center justify-between bg-gray-800 text-white p-4">
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Menu className="h-6 w-6" />
        </button>
        <h2 className="text-lg font-semibold">Admin Panel</h2>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed md:static top-0 left-0 z-40 h-full w-64 bg-gray-800 text-white p-4 space-y-2 transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
        <h2 className="text-xl font-bold mb-6 hidden md:block">Admin Panel</h2>
        <a href="/admin" className="hover:bg-gray-700 p-2 rounded block">Dashboard</a>
        <a href="/admin/berita" className="hover:bg-gray-700 p-2 rounded block">Berita</a>
        <a href="/admin/galeri" className="hover:bg-gray-700 p-2 rounded block">Galeri</a>
        <a href="/admin/guru" className="hover:bg-gray-700 p-2 rounded block">Profil Guru</a>
        <a href="/admin/kelas" className="hover:bg-gray-700 p-2 rounded block">Kelas</a>
        <a href="/admin/lomba" className="hover:bg-gray-700 p-2 rounded block">Lomba</a>
        <button
          onClick={handleLogout}
          className="mt-4 bg-red-600 hover:bg-red-700 p-2 rounded w-full"
        >
          Keluar
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-100 p-6 overflow-x-auto">
        {children}
      </main>
    </div>
  );
}
