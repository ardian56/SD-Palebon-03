'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

const Galery = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchGaleri();
  }, []);

  // Mengambil data galeri dari Supabase
  async function fetchGaleri() {
    const { data } = await supabase.from('galeri').select('*').order('tanggal', { ascending: false });
    setData(data);
  }

  return (
    <div className="w-full bg-white">
      <div className="head w-[70%] pt-20 mx-auto">
        <p className="text-4xl font-semibold text-gray-800 text-center mb-5">Galeri</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 px-3 pb-10">
        {data.map((item, i) => (
          <div key={i} className="relative group">
            <Image
              className="rounded-lg object-cover w-full h-60" 
              src={item.gambar} 
              alt={`Galeri ${i + 1}`}
              width={400}
              height={300}
              layout="responsive"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <p className="font-semibold">{item.judul}</p>
              <p className="text-sm">{item.tanggal}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Galery;
