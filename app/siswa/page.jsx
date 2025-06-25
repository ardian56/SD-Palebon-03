'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabaseClient'; 

export default function DaftarSiswaPage() {
  const [data, setData] = useState([]);
  const [filterClassName, setFilterClassName] = useState(''); // Filter berdasarkan nama kelas
  const [classesOptions, setClassesOptions] = useState([]); // <--- INI SUDAH BENAR, TAPI NAMANYA KELASOPTIONS DI BAWAH
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        // 1. Ambil daftar semua kelas untuk filter dropdown
        const { data: classesData, error: classesError } = await supabase
          .from('classes')
          .select('id, name')
          .order('name', { ascending: true });

        if (classesError) {
          throw classesError;
        }
        setClassesOptions(classesData || []); // <--- DISIMPAN KE classesOptions

        // 2. Ambil data user dengan role 'siswa' dan nama kelasnya
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, name, email, role, classes(name)') // Select role dan join ke classes untuk nama kelas
          .eq('role', 'siswa') // Hanya user dengan role 'siswa'
          .order('name', { ascending: true }); // Urutkan berdasarkan nama siswa

        if (usersError) {
          throw usersError;
        }
        setData(usersData || []);

      } catch (err) {
        console.error('Error fetching data:', err.message);
        setError('Gagal memuat data siswa: ' + err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [supabase]);

  const filteredData = filterClassName
    ? data.filter((item) => item.classes?.name.toLowerCase() === filterClassName.toLowerCase())
    : data;

  // Hapus baris ini: const kelasOptions = [...new Set(data.map((item) => item.kelas))];
  // Karena sekarang kita pakai classesOptions yang sudah di-fetch dari tabel classes.

  if (loading) {
    return (
      <div className="p-6 min-h-screen bg-white/90 backdrop-blur-md text-center text-gray-700">
        Memuat daftar siswa...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 min-h-screen bg-white/90 backdrop-blur-md text-center text-red-600">
        <p>{error}</p>
        <p className="mt-4">Pastikan RLS sudah diatur untuk tabel `users` dan `classes` agar user yang login bisa melihat data siswa.</p>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-white/90 backdrop-blur-md">
      <h1 className="text-3xl font-bold text-center text-gray-700 mb-10">Daftar Siswa</h1>

      {/* Filter */}
      <div className="max-w-md mx-auto mb-8 text-gray-700">
        <label className="block mb-2 font-medium">Filter Kelas:</label>
        <div className="flex gap-2">
          <select
            className="flex-1 border border-gray-300 px-3 py-2 rounded-md shadow-sm bg-white"
            value={filterClassName}
            onChange={(e) => setFilterClassName(e.target.value)}
          >
            <option value="">Semua Kelas</option>
            {/* AKSES classesOptions DI SINI */}
            {classesOptions.map((cls) => (
              <option key={cls.id} value={cls.name}>{cls.name}</option>
            ))}
          </select>
          {filterClassName && (
            <button
              onClick={() => setFilterClassName('')}
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
                <th className="text-left px-8 py-4 border-b border-slate-300">Nama</th><th className="text-left px-8 py-4 border-b border-slate-300">Email</th><th className="text-left px-8 py-4 border-b border-slate-300">Kelas</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-6 text-slate-400">
                    {loading ? 'Memuat...' : filterClassName ? `Tidak ada siswa di kelas ${filterClassName}.` : 'Belum ada data siswa.'}
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
                    <td className="px-8 py-4 border-b border-slate-200">{item.name}</td><td className="px-8 py-4 border-b border-slate-200">{item.email}</td><td className="px-8 py-4 border-b border-slate-200">{item.classes?.name || 'Belum Ada Kelas'}</td>
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