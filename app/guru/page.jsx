'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function Guru() {
  const [guruList, setGuruList] = useState([]);

  useEffect(() => {
    const fetchGuru = async () => {
      const { data, error } = await supabase.from('guru').select('*');
      if (error) {
        console.error('Gagal mengambil data guru:', error);
      } else {
        setGuruList(data);
      }
    };

    fetchGuru();
  }, []);

  return (
    <div className="w-full bg-white/90 backdrop-blur-md min-h-screen py-10 px-4 sm:px-10">
      <div className="pt-20 text-center"> {/* Tambahkan text-center di sini */}
        <p className="text-4xl font-semibold text-red-600 border-b border-slate-300 pb-2 mb-10 inline-block">
          Profile Guru
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 px-6 pb-12">
        {guruList.map((guru, idx) => (
          <Link
            key={idx}
            href="#"
            className="bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
          >
            <div className="flex flex-col items-center p-6">
              {/* Foto Guru */}
              <div className="P-3 w-32 h-32 relative rounded-full overflow-hidden shadow-lg mb-4">
                <Image
                  src={guru.foto}
                  alt={`Foto ${guru.nama}`}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
              {/* Nama dan Jabatan Guru */}
              <p className="text-lg font-semibold text-center text-gray-800 mb-1">{guru.nama}</p>
              <span className="text-sm text-gray-500 text-center">{guru.jabatan}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
