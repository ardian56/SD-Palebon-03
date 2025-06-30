// app/guru/absen/page.jsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabaseClient';
import { Edit, Trash2 } from 'lucide-react';

export default function GuruAbsenPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [attendanceForms, setAttendanceForms] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchForms = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role, class_id, classes(name)')
      .eq('id', session.user.id)
      .single();

    if (profileError || profile?.role !== 'guru' || !profile.class_id) {
      setError('Akses ditolak.');
      setLoading(false);
      return;
    }
    setUserData(profile);

    const { data: forms, error: formsError } = await supabase
      .from('attendance_forms')
      .select('*')
      .eq('class_id', profile.class_id)
      .order('date', { ascending: false })
      .order('start_time', { ascending: false });

    if (formsError) {
      setError('Gagal memuat form absensi: ' + formsError.message);
    } else {
      setAttendanceForms(forms || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const handleDelete = async (formId) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus form absensi ini? Semua data absensi siswa yang terkait akan ikut terhapus.")) {
      try {
        // First, delete all attendance records associated with this form
        const { error: recordsError } = await supabase
          .from('attendance_records')
          .delete()
          .eq('form_id', formId);

        if (recordsError) {
          setError("Gagal menghapus data absensi: " + recordsError.message);
          return;
        }

        // Then, delete the attendance form
        const { error: formError } = await supabase
          .from('attendance_forms')
          .delete()
          .eq('id', formId);

        if (formError) {
          setError("Gagal menghapus form: " + formError.message);
        } else {
          setMessage("Form dan semua data absensi terkait berhasil dihapus.");
          setAttendanceForms(attendanceForms.filter(form => form.id !== formId));
        }
      } catch (err) {
        setError("Terjadi kesalahan saat menghapus: " + err.message);
      }
    }
  };

  if (loading) return <div className="p-8 text-center bg-gray-50 min-h-screen">Memuat...</div>;

  // *** PERUBAHAN UTAMA DI SINI ***
  // Menambahkan div pembungkus dengan kelas bg-gray-50 dan min-h-screen
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto p-4 md:p-8 max-w-4xl">
        <Link href="/guru/dashboard" className="text-blue-600 hover:underline mb-4 inline-block">&larr; Kembali ke Dashboard</Link>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Form Absensi Kelas {userData?.classes?.name}
          </h1>
          <Link href="/guru/absen/tambah">
            <button className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-blue-700 transition">
              + Buat Form Baru
            </button>
          </Link>
        </div>

        {message && <p className="mb-4 text-green-600 bg-green-100 p-3 rounded-md">{message}</p>}
        {error && <p className="mb-4 text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}

        <div className="space-y-4">
          {attendanceForms.length > 0 ? (
            attendanceForms.map(form => (
              <div key={form.id} className="bg-white p-5 rounded-lg border shadow-sm">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{form.title}</h2>
                    <p className="text-gray-600 mt-1">{form.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                      <span>🗓️ {new Date(form.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                      <span>⏰ {form.start_time.substring(0, 5)} - {form.end_time.substring(0, 5)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4 sm:mt-0">
                    <Link href={`/guru/absen/${form.id}`}>
                        <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-3 rounded-lg text-sm">
                          Lihat Absensi
                        </button>
                    </Link>
                    <Link href={`/guru/absen/edit/${form.id}`}>
                        <button className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 p-2 rounded-lg" title="Edit">
                          <Edit size={18} />
                        </button>
                    </Link>
                    <button 
                      onClick={() => handleDelete(form.id)}
                      className="bg-red-100 hover:bg-red-200 text-red-800 p-2 rounded-lg" 
                      title="Hapus">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-10">Belum ada form absensi yang dibuat.</p>
          )}
        </div>
      </div>
    </div>
  );
}