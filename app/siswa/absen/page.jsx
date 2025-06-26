// app/siswa/absen/page.jsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabaseClient';

export default function SiswaAbsenPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [formsWithStatus, setFormsWithStatus] = useState([]);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(null);

  const fetchAttendanceData = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      router.push('/auth/signin');
      return;
    }
    setUser(session.user);

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role, class_id, classes(name)')
      .eq('id', session.user.id)
      .single();

    if (profileError || profile?.role !== 'siswa' || !profile.class_id) {
      setMessage('Akses ditolak. Anda harus menjadi siswa dengan kelas yang ditugaskan.');
      setLoading(false);
      return;
    }
    setUserData(profile);

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayString = `${year}-${month}-${day}`;

    const { data: forms, error: formsError } = await supabase
      .from('attendance_forms')
      .select('id, title, description, date, start_time, end_time')
      .eq('class_id', profile.class_id)
      .gte('date', todayString)
      .order('date', { ascending: true });

    if (formsError) {
      setMessage('Gagal memuat data absensi: ' + formsError.message);
      setLoading(false);
      return;
    }

    const { data: records, error: recordsError } = await supabase
        .from('attendance_records')
        .select('form_id, status')
        .eq('student_id', session.user.id);

    if (recordsError) {
        setMessage('Gagal memuat riwayat absensi: ' + recordsError.message);
        setLoading(false);
        return;
    }

    const recordsMap = new Map(records.map(r => [r.form_id, r.status]));
    
    const now = new Date();
    const processedForms = forms.map(form => {
      const [year, month, day] = form.date.split('-').map(Number);
      const [startHour, startMinute] = form.start_time.split(':').map(Number);
      const [endHour, endMinute] = form.end_time.split(':').map(Number);

      const startTime = new Date(year, month - 1, day, startHour, startMinute);
      const endTime = new Date(year, month - 1, day, endHour, endMinute);
      
      return {
        ...form,
        status: recordsMap.get(form.id) || null,
        is_active: now >= startTime && now <= endTime,
        is_over: now > endTime
      };
    });

    setFormsWithStatus(processedForms);
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    fetchAttendanceData();
  }, [router, supabase]);

  const handleAttend = async (formId, attendanceStatus) => {
    setSubmitting(formId);
    setMessage('');

    const { error } = await supabase.from('attendance_records').insert({
      form_id: formId,
      student_id: user.id,
      status: attendanceStatus,
      submitted_at: new Date().toISOString()
    });

    if (error) {
      if (error.code === '23505') {
        setMessage('Anda sudah mengisi absensi untuk form ini.');
      } else {
        setMessage('Gagal mengirim absensi: ' + error.message);
      }
    } else {
      await fetchAttendanceData();
    }
    setSubmitting(null);
  };

  if (loading) {
    return <div className="p-8 text-center bg-gray-50 min-h-screen">Memuat daftar absensi...</div>;
  }

  // *** PERUBAHAN UTAMA DI SINI: Latar belakang dan warna teks ***
  return (
    <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto p-4 md:p-8 max-w-4xl">
        <Link href="/siswa/dashboard" className="text-blue-600 hover:underline mb-4 inline-block">&larr; Kembali ke Dashboard</Link>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Absensi Kelas</h1>
        <p className="text-gray-600 mb-6">Berikut adalah daftar absensi yang tersedia untuk hari ini.</p>

        {message && <p className="mb-4 text-red-600 bg-red-100 p-2 rounded-md">{message}</p>}

        <div className="space-y-4">
            {formsWithStatus.length > 0 ? (
            formsWithStatus.map(form => (
                <div key={form.id} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                        <h2 className="text-xl font-bold text-gray-900">{form.title}</h2>
                        { (form.is_active && !form.status) && <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">Tersedia</span> }
                        { form.status === 'Hadir' && <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">Anda Hadir</span> }
                        { form.status === 'Tidak Hadir' && <span className="px-3 py-1 text-sm font-semibold rounded-full bg-orange-100 text-orange-800">Anda Tidak Hadir</span> }
                        { (form.is_over && !form.status) && <span className="px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800">Terlewat</span> }
                    </div>
                <p className="text-gray-600 mt-1">{form.description || 'Tidak ada deskripsi.'}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500 my-3">
                    <span>🗓️ {new Date(form.date).toLocaleDateString('id-ID', { dateStyle: 'full' })}</span>
                    <span>⏰ {form.start_time.substring(0, 5)} - {form.end_time.substring(0, 5)}</span>
                </div>
                
                { form.is_active && !form.status && (
                    <div className="flex gap-4 mt-4">
                    <button 
                        onClick={() => handleAttend(form.id, 'Hadir')}
                        disabled={submitting === form.id}
                        className="flex-1 bg-green-500 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-green-600 disabled:bg-green-300 transition"
                    >
                        {submitting === form.id ? 'Loading...' : 'Hadir'}
                    </button>
                    <button 
                        onClick={() => handleAttend(form.id, 'Tidak Hadir')}
                        disabled={submitting === form.id}
                        className="flex-1 bg-red-500 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-red-600 disabled:bg-red-300 transition"
                    >
                        {submitting === form.id ? 'Loading...' : 'Tidak Hadir'}
                    </button>
                    </div>
                )}
                </div>
            ))
            ) : (
            <p className="text-center text-gray-500 py-10">Tidak ada jadwal absensi untuk hari ini.</p>
            )}
        </div>
        </div>
    </div>
  );
}