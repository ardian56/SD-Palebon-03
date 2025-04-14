'use client';

import '../globals.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  Menu,
  LayoutDashboard,
  Newspaper,
  Image,
  Users,
  BookOpen,
  Trophy,
  LogOut,
  X,
} from 'lucide-react';

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

  if (loading) return <div className="p-6 text-white bg-black min-h-screen">Memuat...</div>;

  return (
    <div className="h-screen flex flex-col md:flex-row bg-[#0d0d0d] text-white font-sans">

      <div className="md:hidden flex items-center justify-between bg-black px-4 py-3 shadow-md">
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Menu className="h-6 w-6 text-orange-500" />
        </button>
        <h2 className="text-sm font-medium text-white">Admin Panel</h2>
        <button onClick={handleLogout}>
         <LogOut className="h-5 w-5 text-red-500" />
        </button>
      </div>

      <aside className={`
        fixed md:static top-0 left-0 z-40 w-48 h-screen bg-[#1a1a1a]
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        flex flex-col justify-between py-4 px-3 shadow-lg md:shadow-none border-r border-gray-700
      `}>

      <div className="md:hidden flex justify-end px-2 pt-2">
        <button
          onClick={() => setSidebarOpen(false)}
          className="text-orange-500 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>






        <div className="space-y-2">
          <h2 className="text-md font-semibold text-orange-400 mb-4 hidden md:block px-2">🛠 Admin</h2>

          {[
            { name: 'Dashboard', href: '/admin', icon: <LayoutDashboard className="h-4 w-4" /> },
            { name: 'Berita', href: '/admin/berita', icon: <Newspaper className="h-4 w-4" /> },
            { name: 'Galeri', href: '/admin/galeri', icon: <Image className="h-4 w-4" /> },
            { name: 'Profil Guru', href: '/admin/guru', icon: <Users className="h-4 w-4" /> },
            { name: 'Kelas', href: '/admin/kelas', icon: <BookOpen className="h-4 w-4" /> },
            { name: 'Lomba', href: '/admin/lomba', icon: <Trophy className="h-4 w-4" /> },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 text-sm px-3 py-2 rounded-md hover:bg-orange-500 hover:text-black transition-colors"
            >
              {item.icon}
              {item.name}
            </a>
          ))}
        </div>

        <div className="px-3 pb-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full justify-center bg-transparent hover:bg-red-600 text-red-400 hover:text-white text-xs px-3 py-2 rounded transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </button>
        </div>
      </aside>

      <main className="flex-1 bg-[#121212] p-4 md:p-6 overflow-y-auto h-screen">
        {children}
      </main>
    </div>
  );
}
