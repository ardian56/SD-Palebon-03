'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image'; // Import Image component for student photos
import Link from 'next/link'; // Import Link component if you plan to have student detail pages
import { createClient } from '@/lib/supabaseClient';

export default function DaftarSiswaPage() {
  const [data, setData] = useState([]);
  const [filterClassName, setFilterClassName] = useState('');
  const [classesOptions, setClassesOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        // 1. Fetch all classes for the filter dropdown
        const { data: classesData, error: classesError } = await supabase
          .from('classes')
          .select('id, name')
          .order('name', { ascending: true });

        if (classesError) {
          throw classesError;
        }
        setClassesOptions(classesData || []);

        // 2. Fetch student data with their class names and photo_url
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, name, email, photo_url, role, classes(name)') // Added photo_url
          .eq('role', 'siswa')
          .order('name', { ascending: true });

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

  if (loading) {
    return (
      <div className="w-full bg-white/90 backdrop-blur-md min-h-screen py-10 px-4 sm:px-10 text-center text-gray-700">
        <div className="pt-20 text-center">
          <p className="text-4xl font-semibold text-red-600 border-b border-slate-300 pb-2 mb-10 inline-block">
            Daftar Siswa
          </p>
        </div>
        Memuat daftar siswa...
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-white/90 backdrop-blur-md min-h-screen py-10 px-4 sm:px-10 text-center text-red-600">
        <div className="pt-20 text-center">
          <p className="text-4xl font-semibold text-red-600 border-b border-slate-300 pb-2 mb-10 inline-block">
            Daftar Siswa
          </p>
        </div>
        <p>{error}</p>
        <p className="mt-4">Pastikan RLS sudah diatur untuk tabel `users` dan `classes` agar user yang login bisa melihat data siswa.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white/90 backdrop-blur-md min-h-screen py-10 px-4 sm:px-10">
      <div className="pt-20 text-center">
        <p className="text-4xl font-semibold text-red-600 border-b border-slate-300 pb-2 mb-10 inline-block">
          Daftar Siswa
        </p>
      </div>

      {/* Filter */}
      <div className="max-w-md mx-auto mb-8 text-gray-700">
        <label htmlFor="class-filter" className="block mb-2 font-medium">Filter Kelas:</label>
        <div className="flex gap-2">
          <select
            id="class-filter"
            className="flex-1 border border-gray-300 px-3 py-2 rounded-md shadow-sm bg-white"
            value={filterClassName}
            onChange={(e) => setFilterClassName(e.target.value)}
          >
            <option value="">Semua Kelas</option>
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

      {/* Grid Layout for Students */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 px-6 pb-12">
        {filteredData.length === 0 ? (
          <div className="col-span-full text-center text-slate-400 py-10">
            {loading ? 'Memuat...' : filterClassName ? `Tidak ada siswa di kelas ${filterClassName}.` : 'Belum ada data siswa.'}
          </div>
        ) : (
          filteredData.map((siswa) => (
            <Link
              key={siswa.id}
              href="#" // Adjust this if you plan to have student detail pages
              className="bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
            >
              <div className="flex flex-col items-center p-6">
                {/* Foto Siswa */}
                <div className="w-32 h-32 relative rounded-full overflow-hidden shadow-lg mb-4">
                  {siswa.photo_url ? (
                    <Image
                      src={siswa.photo_url}
                      alt={`Foto ${siswa.name}`}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-5xl">
                      {siswa.name ? siswa.name[0].toUpperCase() : 'S'}
                    </div>
                  )}
                </div>
                {/* Nama dan Kelas Siswa */}
                <p className="text-lg font-semibold text-center text-gray-800 mb-1">{siswa.name}</p>
                <span className="text-sm text-gray-500 text-center">
                  {siswa.classes?.name ? `Kelas ${siswa.classes.name}` : 'Belum Ada Kelas'}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}