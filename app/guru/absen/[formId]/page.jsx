// app/guru/absen/[formId]/page.jsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabaseClient';

export default function DetailAbsenPage() {
  const router = useRouter();
  const params = useParams();
  const formId = params.formId;
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [formDetails, setFormDetails] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [summary, setSummary] = useState({ totalSiswa: 0, hadir: 0, tidakHadir: 0 });

  useEffect(() => {
    if (!formId) return;

    const fetchDetails = async () => {
      setLoading(true);

      const { data: form, error: formError } = await supabase
        .from('attendance_forms')
        .select('*, classes(name)')
        .eq('id', formId)
        .single();

      if (formError || !form) {
        setMessage('Gagal memuat detail form atau form tidak ditemukan.');
        setLoading(false);
        return;
      }
      setFormDetails(form);

      const { data: students, error: studentsError } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('role', 'siswa')
        .eq('class_id', form.class_id)
        .order('name', { ascending: true });

      if (studentsError) {
        setMessage('Gagal memuat daftar siswa.');
        setLoading(false);
        return;
      }

      const { data: records, error: recordsError } = await supabase
        .from('attendance_records')
        .select('student_id, status, submitted_at')
        .eq('form_id', formId);

      if (recordsError) {
        setMessage('Gagal memuat data absensi.');
        setLoading(false);
        return;
      }

      const now = new Date();
      const endTime = new Date(`${form.date}T${form.end_time}`);
      const isExpired = now > endTime;

      const recordsMap = new Map(records.map(r => [r.student_id, { status: r.status, submitted_at: r.submitted_at }]));
      
      const combinedData = students.map(student => {
        const record = recordsMap.get(student.id);
        let finalStatus = 'Belum Mengisi';
        let submissionTime = null;

        if (record) {
          finalStatus = record.status;
          submissionTime = record.submitted_at;
        } else if (isExpired) {
          finalStatus = 'Tidak Hadir';
        }

        return {
          ...student,
          status: finalStatus,
          submitted_at: submissionTime,
        };
      });
      setAttendanceData(combinedData);

      const totalSiswa = students.length;
      const hadirCount = combinedData.filter(s => s.status === 'Hadir').length;
      const tidakHadirCount = combinedData.filter(s => s.status === 'Tidak Hadir').length;

      setSummary({ totalSiswa, hadir: hadirCount, tidakHadir: tidakHadirCount });
      setLoading(false);
    };

    fetchDetails();
  }, [formId, supabase]);

  if (loading) {
    return <div className="p-8 text-center bg-gray-50 min-h-screen">Memuat detail absensi...</div>;
  }
  
  // *** PERUBAHAN UTAMA DI SINI: Latar belakang dan warna teks ***
  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-8">
      <div className="container mx-auto max-w-5xl">
        <Link href="/guru/absen" className="text-blue-600 hover:underline mb-4 inline-block">&larr; Kembali ke Daftar Form</Link>
        
        {formDetails && (
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Detail Absensi - {formDetails.title}</h1>
        )}

        {message && <p className="mb-4 text-red-600">{message}</p>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
          <div className="bg-white p-4 rounded-lg shadow text-center">
              <h3 className="text-lg text-gray-800">Total Siswa</h3>
              <p className="text-3xl font-bold text-gray-900">{summary.totalSiswa}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
              <h3 className="text-lg text-green-600">Hadir</h3>
              <p className="text-3xl font-bold text-green-600">{summary.hadir}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
              <h3 className="text-lg text-red-600">Tidak Hadir</h3>
              <p className="text-3xl font-bold text-red-600">{summary.tidakHadir}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Detail Form</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <h3 className="font-semibold text-gray-800">Deskripsi</h3>
                    <p className="text-gray-600">{formDetails?.description || '-'}</p>
                </div>
                <div>
                    <h3 className="font-semibold text-gray-800">Waktu Aktif</h3>
                    <p className="text-gray-600">{formDetails ? `${formDetails.start_time.substring(0, 5)} - ${formDetails.end_time.substring(0, 5)}`: '-'}</p>
                </div>
            </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Daftar Absensi Siswa</h2>
          <div className="space-y-3">
            {attendanceData.map(student => (
              <div key={student.id} className="flex justify-between items-center p-3 border-b border-gray-200">
                <div>
                  <p className="font-bold text-gray-900">{student.name}</p>
                  <p className="text-sm text-gray-500">{student.email}</p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full text-white ${
                    student.status === 'Hadir' ? 'bg-green-500' : 
                    student.status === 'Tidak Hadir' ? 'bg-red-500' : 
                    'bg-gray-400'
                  }`}>
                    {student.status}
                  </span>
                  {student.submitted_at && (
                      <p className="text-xs text-gray-500 mt-1">{new Date(student.submitted_at).toLocaleString('id-ID')}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}