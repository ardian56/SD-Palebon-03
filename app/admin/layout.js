'use client';

import '../globals.css';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { LogOut, Menu } from 'lucide-react';
import { useState } from 'react';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="h-screen flex overflow-hidden">
      <aside
        className={`fixed z-40 inset-y-0 left-0 w-64 bg-gray-800 text-white transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:flex md:flex-col md:w-64`}
      >
        <div className="flex flex-col p-4 h-full">
          <h2 className="text-xl font-bold mb-6">Admin Panel</h2>

          <nav className="flex-1 space-y-2 overflow-y-auto">
            <a href="/admin/" className="hover:bg-gray-700 p-2 rounded block">Dashboard</a>
            <a href="/admin/berita" className="hover:bg-gray-700 p-2 rounded block">Berita</a>
            <a href="/admin/galeri" className="hover:bg-gray-700 p-2 rounded block">Galeri</a>
            <a href="/admin/guru" className="hover:bg-gray-700 p-2 rounded block">Profil Guru</a>
            <a href="/admin/kelas" className="hover:bg-gray-700 p-2 rounded block">Kelas</a>
            <a href="/admin/lomba" className="hover:bg-gray-700 p-2 rounded block">Lomba</a>
          </nav>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition duration-200 mt-4"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="bg-white shadow-md px-4 py-3 flex items-center md:hidden">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-700">
            <Menu size={24} />
          </button>
          <h1 className="ml-4 text-lg font-semibold">Admin Panel</h1>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
