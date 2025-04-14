// app/admin/page.js

'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, BookOpen, Image, Trophy, User } from 'lucide-react';

export default function AdminDashboard() {
  const [jumlahSiswa, setJumlahSiswa] = useState(0);
  const [jumlahGuru, setJumlahGuru] = useState(0);
  const [jumlahBerita, setJumlahBerita] = useState(0);
  const [jumlahGaleri, setJumlahGaleri] = useState(0);
  const [jumlahLomba, setJumlahLomba] = useState(0);

  useEffect(() => {
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    const { count: siswaCount } = await supabase.from('kelas').select('*', { count: 'exact', head: true });
    const { count: guruCount } = await supabase.from('guru').select('*', { count: 'exact', head: true });
    const { count: beritaCount } = await supabase.from('berita').select('*', { count: 'exact', head: true });
    const { count: galeriCount } = await supabase.from('galeri').select('*', { count: 'exact', head: true });
    const { count: lombaCount } = await supabase.from('lomba').select('*', { count: 'exact', head: true });

    setJumlahSiswa(siswaCount || 0);
    setJumlahGuru(guruCount || 0);
    setJumlahBerita(beritaCount || 0);
    setJumlahGaleri(galeriCount || 0);
    setJumlahLomba(lombaCount || 0);
  };

  const cardData = [
    { label: 'Siswa', icon: <Users className="text-orange-400" size={28} />, count: jumlahSiswa },
    { label: 'Guru', icon: <User className="text-orange-400" size={28} />, count: jumlahGuru },
    { label: 'Berita', icon: <BookOpen className="text-orange-400" size={28} />, count: jumlahBerita },
    { label: 'Galeri', icon: <Image className="text-orange-400" size={28} />, count: jumlahGaleri },
    { label: 'Lomba', icon: <Trophy className="text-orange-400" size={28} />, count: jumlahLomba },
  ];

  return (
    <div className="min-h-screen bg-[#111] p-6 text-white">
      <div className="bg-[#1a1a1a] p-6 rounded-2xl shadow-md border border-gray-700 mb-8">
        <h1 className="text-3xl font-bold mb-2 text-orange-400">Selamat Datang di Admin Panel</h1>
        <p className="text-lg text-gray-300">
          Gunakan menu di sebelah kiri untuk mengelola konten berita, galeri, guru, kelas, dan lomba.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {cardData.map((item) => (
          <div
            key={item.label}
            className="bg-[#1a1a1a] rounded-2xl border border-gray-700 shadow-sm p-4 flex items-center gap-4"
          >
            {item.icon}
            <div>
              <div className="text-xl font-semibold text-white">{item.count}</div>
              <div className="text-sm text-gray-400">{item.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
