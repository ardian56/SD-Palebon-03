// app/siswa/materi/page.jsx
"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabaseClient'; // Sesuaikan path

// Komponen untuk menampilkan daftar materi kelas siswa
function SiswaMateriContent() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null); // Data profil siswa (untuk class_id)
  const [classMaterials, setClassMaterials] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchClassMaterials = async () => {
      setLoading(true);
      setMessage('');

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (!session || sessionError) {
        router.push('/auth/signin');
        return;
      }
      setUser(session.user);

      // Ambil profil siswa untuk mendapatkan class_id mereka
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('name, role, class_id, classes(name)') // Join classes untuk nama kelas
        .eq('id', session.user.id)
        .single();

      if (profileError || profile?.role !== 'siswa' || !profile.class_id) {
        setMessage('Akses ditolak: Anda bukan siswa atau belum ditugaskan ke kelas.');
        await supabase.auth.signOut();
        router.push('/');
        return;
      }
      setUserData(profile);

      // Ambil materi kelas yang sesuai dengan class_id siswa
      const { data: fetchedMaterials, error: materialsError } = await supabase
        .from('class_materials')
        .select('*, users!class_materials_created_by_fkey(name)') // Join users untuk nama guru pembuat
        .eq('class_id', profile.class_id)
        .order('created_at', { ascending: false }); // Materi terbaru di atas

      if (materialsError) {
        setMessage('Error fetching class materials: ' + materialsError.message);
        setLoading(false);
        return;
      }
      setClassMaterials(fetchedMaterials);
      setLoading(false);
    };

    fetchClassMaterials();

    // Real-time listener untuk perubahan pada materi kelas ini
    const materialsSubscription = supabase
      .channel('siswa_class_materials_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'class_materials', filter: `class_id=eq.${userData?.class_id}` },
        payload => {
          console.log('Class material change detected!', payload);
          fetchClassMaterials(); // Muat ulang data saat ada perubahan materi
        }
      )
      .subscribe();

    return () => {
      materialsSubscription.unsubscribe();
    };

  }, [router, supabase, userData?.class_id, user?.id]); // Tambahkan class_id dan user.id ke dependencies

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-blue-600 text-lg">Memuat daftar materi kelas...</div>
      </div>
    );
  }

  if (message) {
    return (
      <div className="container mx-auto p-4 md:p-8 max-w-4xl font-sans">
        <p className="mb-4 p-3 rounded bg-red-100 text-red-700">
          {message}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-100">
        <div className="container mx-auto p-4 md:p-8 max-w-4xl font-sans">
      <Link href="/siswa/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Kembali ke Dashboard
      </Link>

      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Materi Kelas Anda {userData?.classes?.name ? `(${userData.classes.name})` : ''}
      </h1>
      <p className="text-gray-600 mb-6">
        Berikut adalah materi pembelajaran yang telah diberikan guru Anda.
      </p>

      {classMaterials.length === 0 ? (
        <p className="text-gray-500">Belum ada materi kelas yang ditambahkan untuk kelas Anda.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classMaterials.map((material) => (
            <div key={material.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{material.title}</h2>
              <p className="text-gray-600 text-sm mb-1">Mata Pelajaran: <span className="font-medium">{material.subject}</span></p>
              <p className="text-gray-600 text-sm mb-3">Dibuat oleh: <span className="font-medium">{material.users?.name || 'Guru'}</span></p>
              <p className="text-gray-700 mb-4 text-sm line-clamp-3">{material.description || 'Tidak ada deskripsi.'}</p>

              {material.file_url ? (
                <a
                  href={material.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:underline text-sm font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Lihat File Materi ({material.file_name})
                </a>
              ) : (
                <p className="text-gray-500 text-sm">Tidak ada file lampiran.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
    </div>
  );
}

export default function SiswaMateriPage() {
  return (
    <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="text-blue-600 text-lg">Memuat halaman materi siswa...</div>
        </div>
    }>
      <SiswaMateriContent />
    </Suspense>
  );
}
