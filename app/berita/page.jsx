'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

const Berita = () => {
  const [berita, setBerita] = useState([]);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    fetchBerita();
  }, []);

  const fetchBerita = async () => {
    const { data, error } = await supabase
      .from('berita')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching berita:', error);
    } else {
      setBerita(data);
    }
  };

  const toggleExpand = (index) => {
    setExpanded((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="w-full min-h-screen bg-white/90 backdrop-blur-md px-4 pt-20 pb-20 text-center">
      <h1 className="text-4xl font-bold  text-red-600 border-b border-slate-300 pb-2 mb-10 inline-block">Berita</h1>

      <div className="flex flex-wrap gap-6 justify-center">
        {berita.map((item, index) => (
          <div
            key={item.id}
            className="flex flex-col md:flex-row md:w-[48%] bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-100 transition"
          >
            <div className="relative w-full h-48 sm:w-48% sm:h-auto md:min-h-[200px]">
              <Image
                src={item.gambar}
                alt={item.judul}
                fill
                className="object-cover rounded-t-lg md:rounded-none md:rounded-s-lg"
              />
            </div>

            <div className="flex flex-col justify-between p-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{item.judul}</h2>

              <p className="text-gray-700 text-sm">
                {expanded[index]
                  ? item.isi
                  : item.isi.length > 150
                  ? item.isi.slice(0, 150) + '...'
                  : item.isi}
              </p>

              {item.isi.length > 150 && (
                <button
                  onClick={() => toggleExpand(index)}
                  className="text-blue-600 hover:underline text-sm mt-2 text-left"
                >
                  {expanded[index] ? 'Sembunyikan' : 'Baca selengkapnya'}
                </button>
              )}

              <p className="text-right text-xs text-gray-500 mt-2">
                {new Date(item.created_at).toLocaleDateString('id-ID')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Berita;
