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
    <div className="w-full bg-white min-h-screen">
      <div className="pt-20">
        <p className="text-4xl font-semibold text-gray-700 border-b border-gray-400 pt-2 text-center mb-5">
          Profile Guru
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-10 px-5 pb-10">
        {guruList.map((guru, idx) => (
          <Link
            key={idx}
            href="#"
            className="w-full max-w-sm bg-white border border-gray-200 pt-4 rounded-lg shadow-sm hover:opacity-80"
          >
            <div className="flex flex-col items-center pb-10">
              <Image
                src={guru.foto}
                alt={`Foto ${guru.nama}`}
                width={96}
                height={96}
                className="w-24 h-24 mb-3 rounded-full shadow-lg object-cover"
              />
              <p className="mb-1 text-sm sm:text-xl font-medium text-center text-gray-900">{guru.nama}</p>
              <span className="text-sm sm:text-md text-gray-500">{guru.jabatan}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
