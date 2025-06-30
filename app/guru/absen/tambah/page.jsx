// app/guru/absen/tambah/page.jsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function TambahAbsenPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('07:00'); // Default to 07:00
  const [endTime, setEndTime] = useState('14:00');     // Default to 14:00 (7 hours after start)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/signin');
        return;
      }

      const { data: profile, error } = await supabase
        .from('users')
        .select('role, class_id, classes(name), id') // Select 'id' as well to get created_by
        .eq('id', session.user.id)
        .single();

      if (error || profile?.role !== 'guru' || !profile.class_id) {
        setError('Akses Ditolak.');
        router.push('/guru/dashboard');
        return;
      }
      setUserData(profile);
    };
    checkUser();
  }, [router, supabase]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (!title || !date) {
      setError('Judul dan Tanggal wajib diisi.');
      setLoading(false);
      return;
    }

    if (startTime >= endTime) {
      setError('Waktu mulai harus sebelum waktu selesai.');
      setLoading(false);
      return;
    }
    
    // Check if an attendance form for this date already exists for this guru
    const { data: existingForms, error: checkError } = await supabase
      .from('attendance_forms')
      .select('id')
      .eq('created_by', userData.id)
      .eq('date', date);

    if (checkError) {
      setError('Gagal memeriksa absensi yang ada: ' + checkError.message);
      setLoading(false);
      return;
    }

    if (existingForms && existingForms.length > 0) {
      setError('Anda sudah membuat form absensi untuk tanggal ini.');
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from('attendance_forms').insert({
      title,
      description,
      date,
      start_time: startTime,
      end_time: endTime,
      class_id: userData.class_id,
      created_by: userData.id,
    });

    if (insertError) {
      setError('Gagal membuat form: ' + insertError.message);
    } else {
      setMessage('Form absensi berhasil dibuat!');
      setTimeout(() => router.push('/guru/absen'), 1500);
    }
    setLoading(false);
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-8">
      <div className="container mx-auto max-w-2xl">
        <Link href="/guru/absen" className="text-blue-600 hover:underline mb-4 inline-block">&larr; Kembali</Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Buat Form Absensi Baru</h1>
        <p className="text-gray-600 mb-6">Isi detail form absensi untuk siswa kelas {userData?.classes?.name}</p>

        {message && <p className="mb-4 text-green-700 bg-green-100 p-3 rounded-md">{message}</p>}
        {error && <p className="mb-4 text-red-700 bg-red-100 p-3 rounded-md">{error}</p>}

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-900 mb-1">Judul Absensi</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900"
              placeholder="Contoh: Absensi Harian Matematika"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-1">Deskripsi (Opsional)</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900"
              placeholder="Informasi tambahan mengenai absensi ini"
            ></textarea>
          </div>
          <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-900 mb-1">Tanggal</label>
              <input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900"
                  required
              />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                  <label htmlFor="start_time" className="block text-sm font-medium text-gray-900 mb-1">Jam Mulai</label>
                  <input
                      type="time"
                      id="start_time"
                      value={startTime}
                      readOnly // Make it read-only
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-gray-100 cursor-not-allowed" // Add styling for read-only
                      required
                  />
              </div>
              <div>
                  <label htmlFor="end_time" className="block text-sm font-medium text-gray-900 mb-1">Jam Selesai</label>
                  <input
                      type="time"
                      id="end_time"
                      value={endTime}
                      readOnly // Make it read-only
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-gray-100 cursor-not-allowed" // Add styling for read-only
                      required
                  />
              </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Link href="/guru/absen">
                <button type="button" className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg shadow-sm hover:bg-gray-300 transition">
                    Batal
                </button>
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-sm hover:bg-blue-700 disabled:bg-blue-300 transition"
            >
              {loading ? 'Menyimpan...' : 'Simpan Form'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}