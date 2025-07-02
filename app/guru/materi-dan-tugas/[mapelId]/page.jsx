// app/guru/materi-dan-tugas/[mapelId]/page.jsx
"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabaseClient'; // Sesuaikan path

function MapelSpecificContent() { // Ubah nama komponen
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const mapelId = params.mapelId; // Mengambil mapelId dari URL
  const classId = searchParams.get('classId');

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [mapelName, setMapelName] = useState(''); // Nama mata pelajaran
  const [assignments, setAssignments] = useState([]);
  const [classMaterials, setClassMaterials] = useState([]);
  const [message, setMessage] = useState('');

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

    // Ambil nama mata pelajaran dari tabel 'mapel'
    const { data: mapel, error: mapelError } = await supabase
      .from('mapel')
      .select('name')
      .eq('id', mapelId)
      .single();
    if (mapelError) {
      setMessage('Mata pelajaran tidak ditemukan: ' + mapelError.message);
      setLoading(false);
      return;
    }
    setMapelName(mapel.name);

    // --- Ambil Data Materi Kelas ---
    let queryMaterials = supabase
        .from('class_materials')
        .select('*, users!class_materials_created_by_fkey(name)')
        .eq('mapel_id', mapelId) // Filter berdasarkan mapel_id
        .order('created_at', { ascending: false });

    if (profile.role === 'guru') {
      queryMaterials = queryMaterials.eq('created_by', session.user.id);
    }
    if (classId) {
        queryMaterials = queryMaterials.eq('class_id', classId);
    }

    const { data: materials, error: materialsError } = await queryMaterials;
    if (materialsError) {
      console.error('Error fetching materials:', materialsError.message);
      setMessage('Error fetching materials: ' + materialsError.message);
      setLoading(false);
      return;
    }
    setClassMaterials(materials || []);

    // --- Ambil Data Tugas dan Status Pengumpulan ---
    let queryAssignments = supabase
      .from('assignments')
      .select('*, classes(name), users!assignments_created_by_fkey(name)')
      .eq('mapel_id', mapelId) // Filter berdasarkan mapel_id
      .order('due_date', { ascending: true });

    if (profile.role === 'guru') {
      queryAssignments = queryAssignments.eq('created_by', session.user.id);
    }
    if (classId) {
        queryAssignments = queryAssignments.eq('class_id', classId);
    }

    const { data: fetchedAssignments, error: assignmentsError } = await queryAssignments;
    if (assignmentsError) {
      console.error('Error fetching assignments:', assignmentsError.message);
      setMessage('Error fetching assignments: ' + assignmentsError.message);
      setLoading(false);
      return;
    }

    // Untuk setiap tugas, hitung jumlah pengumpulan
    const assignmentsWithSubmissionCounts = await Promise.all(
      fetchedAssignments.map(async (assignment) => {
        const { data: submissions, error: submissionsError } = await supabase
          .from('student_submissions')
          .select('user_id')
          .eq('assignment_id', assignment.id);

        if (submissionsError) {
          console.error('Error fetching submissions for assignment:', assignment.id, submissionsError.message);
          return { ...assignment, submission_summary: { submitted: 0, total: 'N/A' } };
        }

        // Hitung total siswa di kelas
        const { data: students, error: studentsError } = await supabase
          .from('users')
          .select('id')
          .eq('role', 'siswa')
          .eq('class_id', assignment.class_id);

        const totalStudents = studentsError ? 'N/A' : students.length;
        const submittedCount = submissions.length;

        return {
          ...assignment,
          submission_summary: {
            submitted: submittedCount,
            total: totalStudents
          }
        };
      })
    );

    setAssignments(assignmentsWithSubmissionCounts);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [router, supabase, mapelId, classId, user?.id]);

  const handleDeleteAssignment = async (assignmentIdToDelete) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus tugas ini? Aksi ini tidak dapat dibatalkan.')) {
      setLoading(true);
      setMessage('');
      try {
        const { error } = await supabase
          .from('assignments')
          .delete()
          .eq('id', assignmentIdToDelete)
          .eq('created_by', user.id);

        if (error) {
          throw error;
        }
        setMessage('Tugas berhasil dihapus!');
        fetchData();
      } catch (error) {
        console.error('Error deleting assignment:', error.message);
        setMessage('Gagal menghapus tugas: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteMaterial = async (materialIdToDelete, materialFileName) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus materi ini?')) {
      setLoading(true);
      setMessage('');
      try {
        if (materialFileName) {
            const filePath = `class_materials/${materialFileName}`;
            const { error: storageError } = await supabase.storage
                .from('attach')
                .remove([filePath]);
            if (storageError) {
                console.error('Error deleting material file from storage:', storageError);
            }
        }

        const { error } = await supabase
          .from('class_materials')
          .delete()
          .eq('id', materialIdToDelete)
          .eq('created_by', user.id);

        if (error) {
          throw error;
        }
        setMessage('Materi berhasil dihapus!');
        fetchData();
      } catch (error) {
        console.error('Error deleting material:', error.message);
        setMessage('Gagal menghapus materi: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-blue-600 text-lg">Memuat materi dan tugas...</div>
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
        <Link href={`/guru/materi-dan-tugas?classId=${classId}`} className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali ke Pemilihan Mata Pelajaran
        </Link>

        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          {mapelName} - Materi & Tugas Kelas {userData?.classes?.name ? `(${userData.classes.name})` : ''}
        </h1>
        <p className="text-gray-600 mb-6">
          Kelola materi pembelajaran dan tugas untuk mata pelajaran ini.
        </p>

        {/* Bagian Materi Kelas */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 flex justify-between items-center">
            Materi Kelas
            <Link href={`/guru/materi/tambah?classId=${classId || ''}&mapelId=${mapelId || ''}`} className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
              Tambah Materi Baru
            </Link>
          </h2>
          {classMaterials.length === 0 ? (
            <p className="text-gray-500">Belum ada materi kelas yang ditambahkan untuk mata pelajaran ini.</p>
          ) : (
            <div className="space-y-4">
              {classMaterials.map(material => (
                <div key={material.id} className="p-4 border border-gray-200 rounded-lg shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{material.title}</h3>
                      <p className="text-gray-600 text-sm">Dibuat oleh: {material.users?.name || 'N/A'}</p>
                      <p className="text-gray-700 mt-2 text-sm">{material.description || 'Tidak ada deskripsi.'}</p>
                      {material.file_url && (
                          <a href={material.file_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center text-blue-600 hover:underline text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Lihat File ({material.file_name})
                          </a>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {/* Tombol Edit Materi (jika ada halaman edit materi) */}
                      {/* <Link href={`/guru/materi/edit/${material.id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Edit
                      </Link> */}
                      <button
                        onClick={() => handleDeleteMaterial(material.id, material.file_name)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                        disabled={loading}
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bagian Daftar Tugas */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 flex justify-between items-center">
            Daftar Tugas
            <Link href={`/guru/tugas/tambah?classId=${classId || ''}&mapelId=${mapelId || ''}`} className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
              Tambah Tugas Baru
            </Link>
          </h2>
          {assignments.length === 0 ? (
            <p className="text-gray-500">Belum ada tugas yang diberikan untuk mata pelajaran ini.</p>
          ) : (
            <div className="space-y-4">
              {assignments.map((assignment) => (
                <div key={assignment.id} className="p-4 border border-gray-200 rounded-lg shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{assignment.title}</h3>
                      <p className="text-gray-600 text-sm">Tenggat: {new Date(assignment.due_date).toLocaleString()}</p>
                      <p className="text-gray-600 text-sm">Dibuat oleh: {assignment.users?.name || 'N/A'}</p>
                      <p className="text-gray-700 mt-2">{assignment.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link href={`/guru/tugas/edit/${assignment.id}?classId=${classId}&mapelId=${mapelId}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteAssignment(assignment.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                        disabled={loading}
                      >
                        Hapus
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h4 className="text-md font-semibold text-gray-700 mb-2">Status Pengumpulan:</h4>
                    <p className="text-sm text-gray-700">
                      {assignment.submission_summary.submitted} dari {assignment.submission_summary.total} siswa sudah mengumpulkan.
                    </p>
                    <Link href={`/guru/tugas/lihat-pengumpulan/${assignment.id}`} className="mt-3 inline-block bg-teal-500 text-white px-4 py-2 rounded-md text-sm hover:bg-teal-600 transition-colors">
                      Lihat Siapa Saja yang Mengumpulkan
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MapelSpecificPage() { // Ubah nama export default
  return (
    <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="text-blue-600 text-lg">Memuat halaman mata pelajaran...</div>
        </div>
    }>
      <MapelSpecificContent />
    </Suspense>
  );
}
