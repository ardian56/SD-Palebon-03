'use client';

import '../globals.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AdminLayout({ children }) {
  const router = useRouter();
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

  if (loading) {
    return <div className="p-6">Memuat...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-gray-800 text-white flex flex-col p-4 space-y-2 md:fixed md:h-screen">
        <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
        <a href="/admin" className="hover:bg-gray-700 p-2 rounded">Dashboard</a>
        <a href="/admin/berita" className="hover:bg-gray-700 p-2 rounded">Berita</a>
        <a href="/admin/galeri" className="hover:bg-gray-700 p-2 rounded">Galeri</a>
        <a href="/admin/guru" className="hover:bg-gray-700 p-2 rounded">Profil Guru</a>
        <a href="/admin/kelas" className="hover:bg-gray-700 p-2 rounded">Kelas</a>
        <a href="/admin/lomba" className="hover:bg-gray-700 p-2 rounded">Lomba</a>

        <button
          onClick={handleLogout}
          className="mt-auto bg-red-600 hover:bg-red-700 p-2 rounded"
        >
          Keluar
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 bg-gray-100 p-6 overflow-y-auto min-h-screen">
        {children}
      </main>
    </div>
  );
}
