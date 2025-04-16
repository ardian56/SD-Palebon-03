'use client'
import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const Warta = () => {
  const [wartaList, setWartaList] = useState([])

  useEffect(() => {
    const fetchWarta = async () => {
      const { data, error } = await supabase
        .from('warta')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4)

      if (error) {
        console.error('Error fetching Warta:', error)
      } else {
        setWartaList(data)
      }
    }

    fetchWarta()
  }, [])

  return (
    <div className="w-full min-h-screen bg-white/90 backdrop-blur-md">
      
      {/* Hero Section */}
      <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden">
        <img
          src="/assets/carousel2.png" // Ganti sesuai path gambar kamu
          alt="Hero Warta"
          className="absolute top-0 left-0 w-full h-full object-cover filter blur-md scale-110 brightness-75"
        />
        <div className="relative z-10 flex justify-center items-center h-full">
          <h1 className="text-white text-4xl md:text-5xl font-bold drop-shadow-md">
            WARTA PALEBON
          </h1>
        </div>
      </div>

      {/* Warta Section */}
      <div className="py-10 px-4 text-center">
        <h2 className="text-3xl font-bold text-red-600 border-b border-slate-300 pb-2 mb-10 inline-block">
          
        </h2>

        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {wartaList.map((warta, idx) => (
            <div
              key={idx}
              className="bg-white border border-gray-300 rounded-lg shadow-sm transition hover:shadow-md"
            >
              <div className="bg-red-600 text-white text-xl font-bold p-3 rounded-t-md text-center">
                {warta.judul}
              </div>
              <div className="p-4 flex flex-col justify-between">
                <p className="text-gray-800 mb-4 text-justify">{warta.isi}</p>
                <p className="text-sm text-gray-500 text-right">
                  {new Date(warta.created_at).toLocaleDateString('id-ID')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

export default Warta
