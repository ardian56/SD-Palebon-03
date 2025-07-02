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
  const [mapelData, setMapelData] = useState([]); // Data mata pelajaran dengan materi
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

      // Untuk setiap mata pelajaran, ambil materi di kelas ini
      const mapelWithMaterials = await Promise.all(
        mapel.map(async (m) => {
          // Ambil materi untuk mapel ini di kelas siswa
          const { data: materials, error: materialsError } = await supabase
            .from('class_materials')
            .select('*, users!class_materials_created_by_fkey(name)') // Join users untuk nama guru pembuat
            .eq('mapel_id', m.id) // Filter berdasarkan mapel_id
            .eq('class_id', profile.class_id) // Filter berdasarkan kelas siswa
            .order('created_at', { ascending: false }); // Materi terbaru di atas

          if (materialsError) {
            console.error(`Error fetching materials for ${m.name}:`, materialsError.message);
            return {
              ...m,
              materials: [],
              materialCount: 0,
            };
          }

          return {
            ...m,
            materials: materials || [],
            materialCount: materials ? materials.length : 0,
          };
        })
      );

      // Filter hanya mapel yang memiliki materi
      const mapelWithMaterialsFiltered = mapelWithMaterials.filter(m => m.materialCount > 0);

      setMapelData(mapelWithMaterialsFiltered);
      setLoading(false);
    };

    fetchData();

    // Real-time listener untuk perubahan pada materi kelas ini
    const materialsSubscription = supabase
      .channel('siswa_class_materials_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'class_materials', filter: `class_id=eq.${userData?.class_id || 'NULL'}` },
        payload => {
          console.log('Class material change detected!', payload);
          fetchData(); // Muat ulang data saat ada perubahan materi
        }
      )
      .on( // Listen for mapel changes
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mapel'
        },
        payload => {
          console.log('Mapel change received!', payload);
          fetchData(); // Re-fetch to update mapel data
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
    <div className="w-full min-h-[50vh] bg-gray-100">
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
        Berikut adalah materi pembelajaran yang telah diberikan guru Anda, dikelompokkan per mata pelajaran.
      </p>

      {mapelData.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-500 mb-2">Belum Ada Materi</h3>
          <p className="text-gray-400">Materi kelas belum ditambahkan untuk kelas Anda.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {mapelData.map((mapel) => (
            <div key={mapel.id} className="bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200 rounded-2xl shadow-lg p-8 relative overflow-hidden">
              {/* Background decorative element */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-200/20 to-emerald-300/20 rounded-full -translate-y-16 translate-x-16"></div>
              
              <div className="relative z-10 flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 text-green-600">
                    <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">{mapel.name}</h2>
                </div>
                <span className="bg-green-200 text-green-800 text-sm font-bold px-4 py-2 rounded-full shadow-sm">
                  {mapel.materialCount} Materi
                </span>
              </div>
              
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mapel.materials.map((material) => (
                  <div key={material.id} className="bg-white p-6 rounded-xl border hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-800 flex-1 mr-2">{material.title}</h3>
                      <div className="h-6 w-6 text-blue-500 flex-shrink-0">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">
                      <span className="font-medium">Dibuat oleh:</span> {material.users?.name || 'Guru'}
                    </p>
                    <p className="text-gray-700 mb-4 text-sm line-clamp-3">{material.description || 'Tidak ada deskripsi.'}</p>

                    {material.file_url ? (
                      <a
                        href={material.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-white bg-blue-600 hover:bg-blue-700 text-sm font-medium w-full justify-center p-3 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Lihat File ({material.file_name})
                      </a>
                    ) : (
                      <div className="text-gray-500 text-sm text-center bg-gray-100 p-3 rounded-lg border-2 border-dashed border-gray-300">
                        <svg className="h-8 w-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Tidak ada file lampiran
                      </div>
                    )}
                  </div>
                ))}
              </div>
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
