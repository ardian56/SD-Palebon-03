// app/guru/materi-dan-tugas/page.jsx
"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabaseClient'; // Sesuaikan path

function MateriDanTugasContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const classId = searchParams.get('classId');

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null); // Data profil guru
  const [mapelData, setMapelData] = useState([]); // Data mata pelajaran dengan hitungan
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setMessage('');

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (!session || sessionError) {
        router.push('/auth/signin');
        return;
      }
      setUser(session.user);

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('name, role, classes(id, name)')
        .eq('id', session.user.id)
        .single();

      if (profileError || (!['guru', 'super_admin'].includes(profile?.role))) {
        setMessage('Akses ditolak: Anda tidak memiliki izin untuk melihat halaman ini.');
        await supabase.auth.signOut();
        router.push('/');
        return;
      }
      setUserData(profile);

      if (profile.role === 'guru' && classId !== profile.classes?.id && classId) {
          setMessage('Akses ditolak: Anda tidak memiliki izin untuk melihat kelas ini.');
          setLoading(false);
          return;
      }

      // Ambil semua mata pelajaran dari tabel 'mapel'
      const { data: mapel, error: mapelError } = await supabase
        .from('mapel') // Mengambil dari tabel 'mapel'
        .select('*')
        .order('name', { ascending: true });

      if (mapelError) {
        setMessage('Error fetching mapel: ' + mapelError.message);
        setLoading(false);
        return;
      }

      // Untuk setiap mata pelajaran, hitung jumlah materi dan tugas di kelas ini
      const mapelWithCounts = await Promise.all(
        mapel.map(async (m) => {
          // Hitung materi
          const { count: materialCount, error: materialError } = await supabase
            .from('class_materials')
            .select('id', { count: 'exact' })
            .eq('mapel_id', m.id) // Filter berdasarkan mapel_id
            .eq('class_id', classId); // Filter berdasarkan kelas yang dipilih

          if (materialError) console.error(`Error counting materials for ${m.name}:`, materialError.message);

          // Hitung tugas
          const { count: assignmentCount, error: assignmentError } = await supabase
            .from('assignments')
            .select('id', { count: 'exact' })
            .eq('mapel_id', m.id) // Filter berdasarkan mapel_id
            .eq('class_id', classId); // Filter berdasarkan kelas yang dipilih

          if (assignmentError) console.error(`Error counting assignments for ${m.name}:`, assignmentError.message);

          return {
            ...m,
            materialCount: materialCount || 0,
            assignmentCount: assignmentCount || 0,
          };
        })
      );

      setMapelData(mapelWithCounts);
      setLoading(false);
    };

    fetchData();

    // Real-time listeners
    const mapelChanges = supabase
      .channel('guru_mapel_counts_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'class_materials', filter: classId ? `class_id=eq.${classId}` : undefined },
        payload => { fetchData(); }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'assignments', filter: classId ? `class_id=eq.${classId}` : undefined },
        payload => { fetchData(); }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'mapel' }, // Jika nama mapel berubah
        payload => { fetchData(); }
      )
      .subscribe();

    return () => {
      mapelChanges.unsubscribe();
    };
  }, [router, supabase, classId, user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-blue-600 text-lg">Memuat daftar mata pelajaran...</div>
      </div>
    );
  }

  if (message) {
    return (
      <div className="w-full bg-gray-100 min-h-screen">
        <div className="container mx-auto p-4 md:p-8 max-w-4xl font-sans">
          <p className={`mb-4 p-3 rounded ${message.includes('Gagal') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-100 min-h-screen">
      <div className="container mx-auto p-4 md:p-8 max-w-4xl font-sans">
        <Link href="/guru/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali ke Dashboard
        </Link>

        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Materi & Tugas Kelas {userData?.classes?.name ? `(${userData.classes.name})` : ''}
        </h1>
        <p className="text-gray-600 mb-6">
          Pilih mata pelajaran untuk melihat dan mengelola materi serta tugas.
        </p>

        {mapelData.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-500 mb-2">Belum Ada Mata Pelajaran</h3>
            <p className="text-gray-400">Mata pelajaran belum tersedia untuk kelas ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {mapelData.map((m) => (
              <Link
                key={m.id}
                href={`/guru/materi-dan-tugas/${m.id}?classId=${classId}`}
                className="group block relative"
              >
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 text-center transform hover:scale-105 hover:-translate-y-2 relative overflow-hidden">
                  {/* Background decorative element */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/20 to-indigo-300/20 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-300"></div>
                  
                  {/* Book icon */}
                  <div className="relative z-10 mx-auto h-16 w-16 text-blue-600 mb-6 group-hover:text-indigo-600 transition-colors duration-300">
                    <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  
                  <h2 className="relative z-10 text-2xl font-bold text-gray-800 mb-4 group-hover:text-indigo-800 transition-colors duration-300">{m.name}</h2>
                  
                  <div className="relative z-10 flex justify-center space-x-6 mb-4">
                    <div className="text-center">
                      <div className="bg-green-100 text-green-700 rounded-full px-4 py-2 text-sm font-bold mb-1 group-hover:bg-green-200 transition-colors duration-300">
                        {m.materialCount}
                      </div>
                      <p className="text-xs text-gray-600 font-medium">Materi</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-orange-100 text-orange-700 rounded-full px-4 py-2 text-sm font-bold mb-1 group-hover:bg-orange-200 transition-colors duration-300">
                        {m.assignmentCount}
                      </div>
                      <p className="text-xs text-gray-600 font-medium">Tugas</p>
                    </div>
                  </div>
                  
                  {/* Arrow indicator */}
                  <div className="relative z-10 mt-4 flex justify-center">
                    <div className="bg-blue-600 text-white rounded-full p-2 group-hover:bg-indigo-600 transition-colors duration-300">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MateriDanTugasPage() {
  return (
    <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="text-blue-600 text-lg">Memuat halaman mata pelajaran...</div>
        </div>
    }>
      <MateriDanTugasContent />
    </Suspense>
  );
}
