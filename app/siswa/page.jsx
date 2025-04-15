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
    const { data } = await supabase.from('kelas').select('*').order('created_at', { ascending: false });
    setData(data);
  }

  const filteredData = filterKelas
    ? data.filter((item) => item.kelas.toLowerCase() === filterKelas.toLowerCase())
    : data;

  const kelasOptions = [...new Set(data.map((item) => item.kelas))];

  return (
    <div className="p-6 min-h-screen bg-white">
      <h1 className="text-3xl font-bold text-center text-gray-700 mb-8">Daftar Siswa</h1>

      <div className="max-w-sm mx-auto mb-6">
        <label className="block mb-2 text-gray-700 font-medium">Filter Kelas:</label>
        <select
          className="w-full border border-gray-300 px-3 py-2 rounded-md shadow-sm"
          value={filterKelas}
          onChange={(e) => setFilterKelas(e.target.value)}
        >
          <option value="">Semua Kelas</option>
          {kelasOptions.map((kls, i) => (
            <option key={i} value={kls}>{kls}</option>
          ))}
        </select>
      </div>

      {/* Scrollable Table */}
      <div className="overflow-x-auto">
        <table className="w-max min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-3 border-b border-gray-200 whitespace-nowrap">Nama</th>
              <th className="text-left px-4 py-3 border-b border-gray-200 whitespace-nowrap">Kelas</th>
              <th className="text-left px-4 py-3 border-b border-gray-200 whitespace-nowrap">Gender</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center py-4 text-gray-500">Belum ada data siswa.</td>
              </tr>
            ) : (
              filteredData.map((item, index) => (
                <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 border-b border-gray-200">{item.nama}</td>
                  <td className="px-4 py-3 border-b border-gray-200">{item.kelas}</td>
                  <td className="px-4 py-3 border-b border-gray-200">{item.gender}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
