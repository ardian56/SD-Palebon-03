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
    
    <div className="w-full min-h-screen py-10 bg-white/90 backdrop-blur-md px-4 pt-20 pb-20 text-center">
      <h1 className="text-4xl font-bold  text-red-600 border-b border-slate-300 pb-2 mb-10 inline-block">Warta</h1>
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
        {wartaList.map((warta, idx) => (
          <div
            key={idx}
            className="bg-white border border-gray-400 rounded-lg shadow-sm"
          >
            <div className="bg-red-600 text-white text-xl font-bold p-3 rounded-t-md text-center">
              {warta.judul}
            </div>
            <div className="p-4 flex flex-col justify-between">
              <p className="text-gray-800 mb-4">{warta.isi}</p>
              <p className="text-sm text-gray-600 text-right">
                {new Date(warta.created_at).toLocaleDateString('id-ID')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Warta
