// app/siswa/dashboard/page.jsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabaseClient'; 

export default function SiswaDashboard() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [selectedExtracurriculars, setSelectedExtracurriculars] = useState([]);
  const [message, setMessage] = useState('');

  const fetchData = async () => {
    setLoading(true);
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (!session || sessionError) {
      router.push('/auth/signin');
      return;
    }

    setUser(session.user);

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('name, role, photo_url, extracurricular_finalized, classes(name)') 
      .eq('id', session.user.id)
      .single();

    if (profileError || profile?.role !== 'siswa') {
      setMessage('Akses ditolak: Hanya siswa yang dapat melihat dashboard ini.');
      await supabase.auth.signOut();
      router.push('/');
      return;
    }
    setUserData(profile);

    const { data: userExtras, error: userExtrasError } = await supabase
      .from('student_extracurriculars')
      .select('extracurricular_id, extracurriculars(name)')
      .eq('user_id', session.user.id);

    if (userExtrasError) {
      setMessage('Error mengambil ekstra yang dipilih: ' + userExtrasError.message);
      setLoading(false);
      return;
    }
    setSelectedExtracurriculars(userExtras);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();

    // ... (existing subscriptions)
  }, [router, supabase, user?.id]);

  const isFinalized = userData?.extracurricular_finalized;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-blue-600 text-lg">Memuat Dashboard Siswa...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-white-800">Dashboard Siswa</h1>

      {message && (
        <p className={`mb-4 p-3 rounded ${message.includes('Akses ditolak') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </p>
      )}

      {userData && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 flex flex-col items-center md:flex-row md:items-start md:space-x-6">
          {userData.photo_url ? (
              <Image
                src={userData.photo_url}
                alt="Foto Profil"
                width={128}
                height={128}
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-200 mb-4 md:mb-0"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-6xl mb-4 md:mb-0">
                {userData.name ? userData.name[0].toUpperCase() : '?'}
              </div>
            )}
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-semibold text-gray-700">{userData.name}</h2>
            <p className="text-gray-600 mt-1">Role: <span className="font-medium capitalize">{userData.role}</span></p>
            {userData.classes?.name && <p className="text-gray-600">Kelas: <span className="font-medium">{userData.classes.name}</span></p>}
            {user.email && <p className="text-gray-600">Email: <span className="font-medium">{user.email}</span></p>}
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Ekstrakurikuler Pilihan Anda</h2>
        {isFinalized && (
            <p className="text-sm text-green-700 mb-2 font-medium">Status: Pilihan sudah difinalisasi.</p>
        )}
        {selectedExtracurriculars.length > 0 ? (
          <ul className="space-y-2">
            {selectedExtracurriculars.map((extra) => (
              <li key={extra.extracurricular_id} className="bg-blue-50 p-3 rounded-md">
                <span className="text-blue-800 font-medium">{extra.extracurriculars.name}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">Anda belum memilih ekstrakurikuler.</p>
        )}
        {!isFinalized && selectedExtracurriculars.length < 2 && (
            <p className="text-sm text-gray-600 mt-4">Anda dapat memilih hingga 2 ekstrakurikuler.</p>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/siswa/ekstra" className="block">
          <button className="w-full bg-blue-600 text-white p-4 rounded-lg shadow-md hover:bg-blue-700 transition-colors text-lg font-semibold flex items-center justify-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h-4v4h4v-4z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{isFinalized ? 'Lihat Pilihan Ekstrakurikuler' : 'Pilih & Kelola Ekstrakurikuler'}</span>
          </button>
        </Link>
        
        {/* --- MODIFICATION START --- */}
        <Link href="/siswa/absen" className="block">
          <button className="w-full bg-green-600 text-white p-4 rounded-lg shadow-md hover:bg-green-700 transition-colors text-lg font-semibold flex items-center justify-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <span>Lihat Absensi</span>
          </button>
        </Link>
        {/* --- MODIFICATION END --- */}

        <Link href="/siswa/tugas" className="block">
          <button className="w-full bg-purple-600 text-white p-4 rounded-lg shadow-md hover:bg-purple-700 transition-colors text-lg font-semibold flex items-center justify-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <span>Lihat Tugas</span>
          </button>
        </Link>
      </div>
    </div>
  );
}