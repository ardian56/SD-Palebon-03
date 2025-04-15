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
    <div className="w-full bg-white">
      <div className="head w-[70%] pt-20 mx-auto">
        <p className="text-4xl font-semibold text-gray-800 text-center mb-5">Galeri</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 px-3 pb-10">
        {data.map((item, i) => (
          <div key={i} className="relative group">
            <div className="card bg-white rounded-lg shadow-lg overflow-hidden w-full h-20 md:h-48 relative"> 
              <Image
                className="object-cover w-full h-full cursor-pointer"
                src={item.gambar}
                alt={`Galeri ${i + 1}`}
                width={400}
                height={300}
                layout="intrinsic"
                onClick={() => handleImageClick(item.gambar, item.judul, item.tanggal)}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="font-semibold">{item.judul}</p>
                <p className="text-sm">{item.tanggal}</p>
              </div>
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
  );
};

export default Galery;
