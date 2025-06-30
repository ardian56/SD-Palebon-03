// app/guru/absen/edit/[formId]/page.jsx
"use client";

import { useState, useEffect } from 'react'; //
import { useRouter, useParams } from 'next/navigation'; //
import { createClient } from '@/lib/supabaseClient'; //
import Link from 'next/link'; //

export default function EditAbsenPage() {
  const router = useRouter(); //
  const params = useParams(); //
  const formId = params.formId; //
  const supabase = createClient(); //

  const [loading, setLoading] = useState(true); //
  const [message, setMessage] = useState(''); //
  const [error, setError] = useState(''); //

  const [title, setTitle] = useState(''); //
  const [description, setDescription] = useState(''); //
  const [date, setDate] = useState(''); //
  const [startTime, setStartTime] = useState(''); //
  const [endTime, setEndTime] = useState(''); //

  useEffect(() => {
    if (!formId) return; //

    const fetchFormData = async () => {
      setLoading(true); //
      const { data, error } = await supabase
        .from('attendance_forms') //
        .select('*') //
        .eq('id', formId) //
        .single(); //

      if (error || !data) { //
        setError("Gagal memuat data form atau form tidak ditemukan."); //
        setLoading(false); //
        return; //
      }

      setTitle(data.title); //
      setDescription(data.description || ''); //
      setDate(data.date); //
      setStartTime(data.start_time); //
      setEndTime(data.end_time); //
      setLoading(false); //
    };

    fetchFormData(); //
  }, [formId, supabase]); //

  // Handler for start_time change to automatically set end_time
  const handleStartTimeChange = (e) => {
    const newStartTime = e.target.value; //
    setStartTime(newStartTime); //

    // Calculate end time: 8 hours after start time
    if (newStartTime) { //
      const [hours, minutes] = newStartTime.split(':').map(Number); //
      const startDate = new Date(); //
      startDate.setHours(hours, minutes, 0, 0); // Set time, clear seconds/milliseconds

      startDate.setHours(startDate.getHours() + 8); // Add 8 hours

      const newEndHours = String(startDate.getHours()).padStart(2, '0'); //
      const newEndMinutes = String(startDate.getMinutes()).padStart(2, '0'); //
      setEndTime(`${newEndHours}:${newEndMinutes}`); //
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); //
    setLoading(true); //
    setError(''); //
    setMessage(''); //

    if (!title || !date || !startTime || !endTime) { //
      setError('Semua kolom wajib diisi.'); //
      setLoading(false); //
      return; //
    }

    if (startTime >= endTime) { //
      setError('Waktu mulai harus sebelum waktu selesai.'); //
      setLoading(false); //
      return; //
    }

    const { error: updateError } = await supabase
      .from('attendance_forms') //
      .update({
        title, //
        description, //
        date, //
        start_time: startTime, //
        end_time: endTime, //
      })
      .eq('id', formId); //

    if (updateError) { //
      setError('Gagal memperbarui form: ' + updateError.message); //
    } else {
      setMessage('Form absensi berhasil diperbarui!'); //
      setTimeout(() => router.push('/guru/absen'), 1500); //
    }
    setLoading(false); //
  };

  if (loading) { //
    return <div className="p-8 text-center bg-gray-50 min-h-screen">Memuat form...</div>; //
  }

  // *** PERUBAHAN UTAMA DI SINI: Latar belakang dan warna teks ***
  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-8">
      <div className="container mx-auto max-w-2xl">
        <Link href="/guru/absen" className="text-blue-600 hover:underline mb-4 inline-block">&larr; Kembali</Link> {/* */}
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Form Absensi</h1> {/* */}

        {message && <p className="mb-4 text-green-700 bg-green-100 p-3 rounded-md">{message}</p>} {/* */}
        {error && <p className="mb-4 text-red-700 bg-red-100 p-3 rounded-md">{error}</p>} {/* */}

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-900 mb-1">Judul Absensi</label> {/* */}
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-1">Deskripsi (Opsional)</label> {/* */}
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900"
            ></textarea>
          </div>
          <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-900 mb-1">Tanggal</label> {/* */}
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
                  <label htmlFor="start_time" className="block text-sm font-medium text-gray-900 mb-1">Jam Mulai</label> {/* */}
                  <input
                      type="time"
                      id="start_time"
                      value={startTime}
                      onChange={handleStartTimeChange} // Use the new handler
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900"
                      required
                  />
              </div>
              <div>
                  <label htmlFor="end_time" className="block text-sm font-medium text-gray-900 mb-1">Jam Selesai</label> {/* */}
                  <input
                      type="time"
                      id="end_time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900"
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
              {loading ? 'Memperbarui...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}