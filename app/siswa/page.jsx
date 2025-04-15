'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function KelasPage() {
  const [data, setData] = useState([]);
  const [filterKelas, setFilterKelas] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data } = await supabase
      .from('kelas')
      .select('*')
      .order('kelas_order', { ascending: true });

    setData(data || []);
  }

  const filteredData = filterKelas
    ? data.filter((item) => item.kelas.toLowerCase() === filterKelas.toLowerCase())
    : data;

  const kelasOptions = [...new Set(data.map((item) => item.kelas))];

  return (
    <div className="p-6 min-h-screen bg-white/90 backdrop-blur-md">
      <h1 className="text-3xl font-bold text-center text-gray-700 mb-10">Daftar Siswa</h1>

      {/* Filter */}
      <div className="max-w-md mx-auto mb-8 text-gray-700">
        <label className="block mb-2 font-medium">Filter Kelas:</label>
        <div className="flex gap-2">
          <select
            className="flex-1 border border-gray-300 px-3 py-2 rounded-md shadow-sm bg-white"
            value={filterKelas}
            onChange={(e) => setFilterKelas(e.target.value)}
          >
            <option value="">Semua Kelas</option>
            {kelasOptions.map((kls, i) => (
              <option key={i} value={kls}>
                {kls}
              </option>
            ))}
          </select>
          {filterKelas && (
            <button
              onClick={() => setFilterKelas('')}
              className="px-3 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Scrollable & Wider Table */}
      <div className="overflow-x-auto max-w-7xl mx-auto px-2 sm:px-4">
        <div className="border border-slate-200 rounded-xl shadow-md max-h-[650px] overflow-y-auto">
          <table className="min-w-[800px] w-full text-base text-slate-700">
            <thead className="bg-slate-100 text-slate-800 sticky top-0 z-10">
              <tr>
                <th className="text-left px-8 py-4 border-b border-slate-300">Nama</th>
                <th className="text-left px-8 py-4 border-b border-slate-300">Kelas</th>
                <th className="text-left px-8 py-4 border-b border-slate-300">Gender</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-6 text-slate-400">
                    Belum ada data siswa.
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr
                    key={item.id}
                    className={
                      index % 2 === 0
                        ? 'bg-white hover:bg-slate-100'
                        : 'bg-slate-50 hover:bg-slate-100'
                    }
                  >
                    <td className="px-8 py-4 border-b border-slate-200">{item.nama}</td>
                    <td className="px-8 py-4 border-b border-slate-200">{item.kelas}</td>
                    <td className="px-8 py-4 border-b border-slate-200">{item.gender}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
