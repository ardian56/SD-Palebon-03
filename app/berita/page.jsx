'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

const Berita = () => {
  const [berita, setBerita] = useState([])

  // State to track expanded articles
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    const fetchBerita = async () => {
      const { data, error } = await supabase
        .from('berita')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching berita:', error)
      } else {
        setBerita(data)
      }
    }

    fetchBerita()
  }, [])

  // Toggle content visibility when "Baca Selengkapnya" is clicked
  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div className="w-full min-h-screen bg-white/90 backdrop-blur-md">
      {/* Hero Section */}
      <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden">
        <img
          src="/assets/carousel2.png"
          alt="Hero Berita"
          className="absolute top-0 left-0 w-full h-full object-cover filter blur-md scale-110 brightness-75"
        />
        <div className="relative z-10 flex justify-center items-center h-full">
          <h1 className="text-white text-4xl md:text-5xl font-bold drop-shadow-md">
            BERITA PALEBON
          </h1>
        </div>
      </div>

      {/* Berita Section */}
      <div className="py-10 px-4 text-center">
        <h2 className="text-3xl font-bold text-red-600 border-b border-slate-300 pb-2 mb-10 inline-block">
          Berita
        </h2>

        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {berita.map((item) => (
            <div
              key={item.id}
              className="flex-col sm:flex-row border border-gray-300 rounded-lg shadow-sm transition hover:shadow-md flex"
            >
              {/* Gambar Berita */}
              <div className="relative w-full sm:w-1/3 h-50 sm:h-full rounded-l-lg  overflow-hidden bg-center">
                <Image
                  src={item.gambar}
                  alt={item.judul}
                  layout="fill" // Ensures the image fills the container
                  objectFit="cover" // Ensures the image covers the container without leaving space
                  objectPosition="center 60%" // Adjusts the image position slightly towards the center
                  className="object-cover"
                />
              </div>

              {/* Konten */}
              <div className="p-4 flex flex-col justify-between w-full sm:w-2/3">
                <h3 className="text-xl font-semibold text-gray-800 mb-2 text-left">
                  {item.judul}
                </h3>
                <p className="text-gray-800 text-justify mb-4">
                  {expandedId === item.id
                    ? item.isi
                    : item.isi.length > 150
                    ? item.isi.slice(0, 150) + '...'
                    : item.isi}
                </p>

                {/* Baca Selengkapnya and Tanggal Section */}
                <div className="flex justify-between items-center mt-auto">
                  <p className="text-sm text-gray-500">
                    {new Date(item.created_at).toLocaleDateString('id-ID')}
                  </p>
                  <button
                    onClick={() => toggleExpand(item.id)}
                    className="text-red-600 text-sm font-medium mt-2 inline-block hover:underline"
                  >
                    {expandedId === item.id ? 'Tutup' : 'Baca Selengkapnya'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Berita
