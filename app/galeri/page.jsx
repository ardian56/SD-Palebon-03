'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { X } from 'lucide-react'; 

const Galery = () => {
  const [data, setData] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null); 
  const [imageDetails, setImageDetails] = useState(null); 

  useEffect(() => {
    fetchGaleri();
  }, []);

  async function fetchGaleri() {
    const { data } = await supabase.from('galeri').select('*').order('tanggal', { ascending: false });
    setData(data);
  }

  const handleImageClick = (image, judul, tanggal) => {
    setSelectedImage(image); 
    setImageDetails({ judul, tanggal }); 
  };

  const closeModal = () => {
    setSelectedImage(null);
    setImageDetails(null);
  };

  return (
    <div className="w-full bg-white/90 backdrop-blur-md min-h-screen pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-center text-red-600 border-b pb-2 mb-10">Galeri Kegiatan</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {data.map((item, i) => (
            <div key={i} className="relative group overflow-hidden rounded-lg shadow hover:shadow-lg transition duration-300">
              <Image
                className="object-cover w-full h-60 cursor-pointer transform hover:scale-105 transition-transform duration-300"
                src={item.gambar}
                alt={`Galeri ${i + 1}`}
                width={400}
                height={300}
                onClick={() => handleImageClick(item.gambar, item.judul, item.tanggal)}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white px-4 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="font-semibold truncate">{item.judul}</p>
                <p className="text-sm">{item.tanggal}</p>
              </div>
            </div>
          ))}
        </div>

        {selectedImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 transition-opacity duration-300 ease-in-out"
            onClick={closeModal}
          >
            <div className="relative bg-white p-6 rounded-lg max-w-4xl w-full">
              <button
                className="absolute top-2 right-2 text-gray-800 p-2 rounded-full bg-white hover:bg-gray-200"
                onClick={closeModal}
              >
                <X size={24} />
              </button>
              <div className="flex justify-center mb-4">
                <Image
                  src={selectedImage}
                  alt="Selected Image"
                  width={800}
                  height={600}
                  objectFit="contain" 
                  className="rounded-lg"
                />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-800">{imageDetails.judul}</h2>
                <p className="text-lg text-gray-500">{imageDetails.tanggal}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Galery;
