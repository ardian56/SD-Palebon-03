'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
// Import createClient dari lib/supabaseClient
import { createClient } from '@/lib/supabaseClient'; 

export default function GuruPage() { // Ubah nama komponen menjadi lebih spesifik
  const [guruList, setGuruList] = useState([]);
  const [loading, setLoading] = useState(true); // Tambahkan state loading
  const [error, setError] = useState(null); // Tambahkan state error

  const supabase = createClient(); // Inisialisasi client

  useEffect(() => {
    async function fetchGuru() {
      setLoading(true);
      setError(null);
      try {
        // Ambil data user dengan role 'guru'
        const { data, error: fetchError } = await supabase
          .from('users') // Mengambil dari tabel users
          .select('id, name, photo_url, role, classes(name)') // Select kolom yang relevan, tambahkan join untuk nama kelas jika guru kelas
          .eq('role', 'guru') // Hanya user dengan role 'guru'
          .order('name', { ascending: true }); // Urutkan berdasarkan nama guru

        if (fetchError) {
          throw fetchError;
        }

        // Karena kita tidak memiliki kolom 'jabatan' lagi, kita bisa menggunakan 'position'
        // Jika Anda ingin menampilkan 'posisi' atau 'kelas_diajar', Anda harus mengambilnya di select
        // dan menampilkannya sesuai. Saat ini, saya mengasumsikan Anda ingin menampilkan `position`
        // yang ada di tabel `users` (meskipun di ERD terakhir tidak ada).
        // Jika `position` tidak ada di tabel users Anda saat ini, ini akan menjadi `undefined`.
        // Jika guru kelas, kita bisa menampilkan `classes.name` sebagai "Guru Kelas [Nama Kelas]"

        setGuruList(data || []);

      } catch (err) {
        console.error('Error fetching guru data:', err.message);
        setError('Gagal memuat data guru: ' + err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchGuru();
  }, [supabase]); // Tambahkan supabase ke dependency array

  if (loading) {
    return (
      <div className="w-full bg-white/90 backdrop-blur-md min-h-screen py-10 px-4 sm:px-10 text-center text-gray-700">
        <div className="pt-20 text-center">
          <p className="text-4xl font-semibold text-red-600 border-b border-slate-300 pb-2 mb-10 inline-block">
            Profile Guru
          </p>
        </div>
        Memuat daftar guru...
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-white/90 backdrop-blur-md min-h-screen py-10 px-4 sm:px-10 text-center text-red-600">
        <div className="pt-20 text-center">
          <p className="text-4xl font-semibold text-red-600 border-b border-slate-300 pb-2 mb-10 inline-block">
            Profile Guru
          </p>
        </div>
        <p>{error}</p>
        <p className="mt-4">Pastikan RLS sudah diatur untuk tabel `users` dan `classes` agar user yang login bisa melihat data guru.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white/90 backdrop-blur-md min-h-screen py-10 px-4 sm:px-10">
      <div className="pt-20 text-center">
        <p className="text-4xl font-semibold text-red-600 border-b border-slate-300 pb-2 mb-10 inline-block">
          Profile Guru
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 px-6 pb-12">
        {guruList.length === 0 ? (
          <div className="col-span-full text-center text-slate-400 py-10">
            Belum ada data guru.
          </div>
        ) : (
          guruList.map((guru, idx) => (
            <Link
              key={guru.id} // Gunakan guru.id sebagai key yang lebih unik
              href="#" // Sesuaikan ini jika ada halaman detail guru
              className="bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
            >
              <div className="flex flex-col items-center p-6">
                {/* Foto Guru */}
                <div className="w-32 h-32 relative rounded-full overflow-hidden shadow-lg mb-4">
                  {guru.photo_url ? (
                    <Image
                      src={guru.photo_url} // Gunakan photo_url dari tabel users
                      alt={`Foto ${guru.name}`}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Improve performance
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-5xl">
                      {guru.name ? guru.name[0].toUpperCase() : 'G'}
                    </div>
                  )}
                </div>
                {/* Nama dan Jabatan Guru */}
                <p className="text-lg font-semibold text-center text-gray-800 mb-1">{guru.name}</p>
                {/* Tampilkan jabatan atau kelas yang diampu */}
                {/* Perlu diingat: di skema ERD terakhir, kolom 'position' sudah dihapus dari tabel users.
                    Jika Anda ingin menampilkan jabatan, Anda perlu kolom 'position' kembali di tabel users.
                    Saat ini, saya akan menampilkan nama kelas yang diampu jika ada (melalui join). */}
                {guru.classes?.name ? (
                  <span className="text-sm text-gray-500 text-center">Guru Kelas {guru.classes.name}</span>
                ) : (
                  <span className="text-sm text-gray-500 text-center">Guru</span> // Default jika tidak ada kelas diampu atau posisi
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}