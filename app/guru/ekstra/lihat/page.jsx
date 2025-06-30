// app/guru/ekstra/lihat/page.jsx
"use client";

import { useState, useEffect, Suspense } from 'react'; // Import Suspense
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabaseClient'; // Adjust path as needed

// Define a separate component to hold the logic that uses useSearchParams
// This is the common pattern to address the Suspense boundary error.
function LihatEkstrakurikulerSiswaContent() {
  const router = useRouter();
  const searchParams = useSearchParams(); // This hook is now inside a client-side component rendered within Suspense
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null); // Role and class info for the current guru
  const [message, setMessage] = useState('');
  const [studentsExtracurricularData, setStudentsExtracurricularData] = useState([]);
  const [attendancesToday, setAttendancesToday] = useState([]);
  const [activeTab, setActiveTab] = useState('status'); // 'status', 'absensi'
  const [filterClassId, setFilterClassId] = useState(null); // Used by regular guru
  const [isSuperAdminViewingAll, setIsSuperAdminViewingAll] = useState(false); // Used by super admin (renamed from isGuruBkViewingAll)


  useEffect(() => {
    const checkUserAndFetchData = async () => {
      setLoading(true);
      setMessage('');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (!session || sessionError) {
        router.push('/auth/signin');
        return;
      }

      setUser(session.user);

      // Fetch current user's profile to determine role and class
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('name, role, classes(id, name)')
        .eq('id', session.user.id)
        .single();

      if (profileError || (!['guru', 'super_admin'].includes(profile?.role))) { // Allow both 'guru' and 'super_admin'
        setMessage('Akses ditolak: Anda tidak memiliki izin untuk melihat halaman ini.');
        await supabase.auth.signOut();
        router.push('/');
        return;
      }
      setUserData(profile);

      let studentsToFetch;
      let availableExtrasToFetch;
      let currentClassFilter = null;
      let viewingAll = false;

      // Determine data fetching strategy based on role and URL parameters
      if (profile.role === 'super_admin') {
        const allParam = searchParams.get('all');
        if (allParam === 'true') {
          viewingAll = true;
          setIsSuperAdminViewingAll(true);
          // Super Admin, fetch all students, INCLUDING 'extracurricular_finalized' status
          const { data: allStudents, error: allStudentsError } = await supabase
            .from('users')
            .select('id, name, extracurricular_finalized, classes(name, id), student_extracurriculars(extracurricular_id, extracurriculars(name))')
            .eq('role', 'siswa'); // Get only students

          if (allStudentsError) {
            setMessage('Error fetching all students: ' + allStudentsError.message);
            setLoading(false);
            return;
          }
          studentsToFetch = allStudents;

          // Super Admin, fetch all extracurriculars (regardless of class_id being null or specific)
          const { data: allExtras, error: allExtrasError } = await supabase
            .from('extracurriculars')
            .select('id, name, description, class_id'); // Get all extras for comparison

          if (allExtrasError) {
            setMessage('Error fetching all extracurriculars: ' + allExtrasError.message);
            setLoading(false);
            return;
          }
          availableExtrasToFetch = allExtras;

        } else {
            // If super admin somehow lands here without 'all=true', default to their own class if they have one
            // This case might be less likely with the new dashboard links.
            currentClassFilter = profile.classes?.id;
            if (!currentClassFilter) {
                setMessage('Super Admin harus melihat semua siswa atau super admin tidak memiliki kelas yang diampu.');
                setLoading(false);
                return;
            }
            setFilterClassId(currentClassFilter); // Set filter class ID
            // Fetch students for this class, INCLUDING 'extracurricular_finalized' status
            const { data: classStudents, error: classStudentsError } = await supabase
                .from('users')
                .select('id, name, extracurricular_finalized, classes(name, id), student_extracurriculars(extracurricular_id, extracurriculars(name))')
                .eq('role', 'siswa')
                .eq('class_id', currentClassFilter);

            if (classStudentsError) {
                setMessage('Error fetching students for class: ' + classStudentsError.message);
                setLoading(false);
                return;
            }
            studentsToFetch = classStudents;

            // Fetch extracurriculars specific to this class
            const { data: classExtras, error: classExtrasError } = await supabase
                .from('extracurriculars')
                .select('id, name, description, class_id')
                .or(`class_id.eq.${currentClassFilter},class_id.is.null`); // Also include general extras

            if (classExtrasError) {
                setMessage('Error fetching class extracurriculars: ' + classExtrasError.message);
                setLoading(false);
                return;
            }
            availableExtrasToFetch = classExtras;
        }

      } else if (profile.role === 'guru') {
        currentClassFilter = searchParams.get('classId');
        if (!currentClassFilter || profile.classes?.id !== currentClassFilter) {
          setMessage('Akses ditolak: ID Kelas tidak valid atau tidak cocok dengan kelas yang Anda ampu.');
          await supabase.auth.signOut();
          router.push('/');
          return;
        }
        setFilterClassId(currentClassFilter); // Set filter class ID

        // Regular Guru, fetch students only from their assigned class, INCLUDING 'extracurricular_finalized' status
        const { data: classStudents, error: classStudentsError } = await supabase
          .from('users')
          .select('id, name, extracurricular_finalized, classes(name, id), student_extracurriculars(extracurricular_id, extracurriculars(name))')
          .eq('role', 'siswa')
          .eq('class_id', currentClassFilter);

        if (classStudentsError) {
          setMessage('Error fetching students for class: ' + classStudentsError.message);
          setLoading(false);
          return;
        }
        studentsToFetch = classStudents;

        // Regular Guru, fetch extracurriculars specific to their class (and general ones)
        const { data: classExtras, error: classExtrasError } = await supabase
          .from('extracurriculars')
          .select('id, name, description, class_id')
          .or(`class_id.eq.${currentClassFilter},class_id.is.null`); // Include general extras as well

        if (classExtrasError) {
          setMessage('Error fetching class extracurriculars: ' + classExtrasError.message);
          setLoading(false);
          return;
        }
        availableExtrasToFetch = classExtras;
      } else {
        setMessage('Peran tidak dikenal.');
        setLoading(false);
        return;
      }

      // Process fetched data to determine selected and unselected extracurriculars
      const processedStudents = studentsToFetch.map(student => {
        const studentSelectedExtraIds = new Set(
          student.student_extracurriculars.map(se => se.extracurricular_id)
        );

        // Map selected extras to their names, filter out nulls if any (e.g., if extra was deleted)
        const selectedExtras = student.student_extracurriculars.map(se => se.extracurriculars?.name).filter(Boolean);
        
        // Filter availableExtrasToFetch based on the student's actual class_id OR if class_id is null (general extra)
        const relevantAvailableExtras = availableExtrasToFetch
            .filter(extra => extra.class_id === student.classes?.id || extra.class_id === null);

        const unselectedExtras = relevantAvailableExtras
          .filter(extra => !studentSelectedExtraIds.has(extra.id))
          .map(extra => extra.name);

        return {
          id: student.id,
          name: student.name,
          className: student.classes?.name || 'Tidak ada kelas',
          // Use extracurricular_finalized from the user's profile
          isFinalized: student.extracurricular_finalized, 
          selectedExtras,
          unselectedExtras, // Keep this for potential future display or logic, even if not displayed
        };
      });

      setStudentsExtracurricularData(processedStudents);

      // Fetch today's attendances
      const today = new Date().toISOString().split('T')[0];
      let attendanceQuery = supabase
        .from('extracurricular_attendances')
        .select(`
          id,
          attendance_date,
          status,
          notes,
          check_in_time,
          student_extracurriculars!inner(
            id,
            users!inner(id, name, class_id, classes(name)),
            extracurriculars!inner(id, name)
          )
        `)
        .eq('attendance_date', today);

      // Filter by class if not super admin viewing all
      if (!viewingAll && currentClassFilter) {
        attendanceQuery = attendanceQuery.eq('student_extracurriculars.users.class_id', currentClassFilter);
      }

      const { data: todayAttendances, error: attendanceError } = await attendanceQuery;

      if (attendanceError) {
        console.error('Error fetching today\'s attendances:', attendanceError);
        setMessage('Error fetching attendance data: ' + attendanceError.message);
      } else {
        setAttendancesToday(todayAttendances || []);
      }

      setLoading(false);
    };

    checkUserAndFetchData();
  }, [router, supabase, searchParams]); // Dependencies for useEffect

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-blue-600 text-lg">Memuat data ekstrakurikuler siswa...</div>
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
  <div className="w-full min-h-screen bg-gray-100">
    <div className="container mx-auto p-4 md:p-8 max-w-4xl font-sans">
      <Link href="/guru/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Kembali ke Dashboard
      </Link>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Daftar Ekstrakurikuler Siswa
        {isSuperAdminViewingAll ? " (Semua Kelas)" : userData?.classes?.name ? ` (${userData.classes.name})` : ''}
      </h1>
      <p className="text-gray-600 mb-6">
        {userData?.role === 'super_admin' ?
         'Anda melihat daftar ekstrakurikuler semua siswa.' :
         `Anda melihat daftar ekstrakurikuler siswa di kelas ${userData?.classes?.name || ''}.`
        }
      </p>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('status')}
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'status' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Status Ekstrakurikuler
        </button>
        <button
          onClick={() => setActiveTab('absensi')}
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'absensi' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Absensi Hari Ini
        </button>
      </div>

      {/* Tab Content: Status Ekstrakurikuler */}
      {activeTab === 'status' && (
        <>
          {studentsExtracurricularData.length === 0 ? (
            <p className="text-gray-500">Tidak ada data siswa ditemukan.</p>
          ) : (
            <div className="overflow-x-auto bg-white rounded-lg shadow-md p-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama Siswa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kelas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status Ekstra
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ekstrakurikuler Diambil
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {studentsExtracurricularData.map((student) => (
                    <tr key={student.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.className}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {student.isFinalized ? (
                          <span className="text-green-600 font-semibold">Sudah Di Ambil</span>
                        ) : (
                          <span className="text-orange-500 font-semibold">Belum Di Ambil</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {student.selectedExtras.length > 0
                          ? student.selectedExtras.join(', ')
                          : <span className="text-gray-400 italic">-</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Tab Content: Absensi Hari Ini */}
      {activeTab === 'absensi' && (
        <>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Absensi Ekstrakurikuler Hari Ini</h2>
          <p className="text-gray-600 mb-4">
            Tanggal: {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          {attendancesToday.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-500">Belum ada siswa yang melakukan absensi ekstrakurikuler hari ini.</p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white rounded-lg shadow-md p-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama Siswa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kelas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ekstrakurikuler
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Waktu Absen
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Keterangan
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendancesToday.map((attendance) => (
                    <tr key={attendance.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {attendance.student_extracurriculars.users.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {attendance.student_extracurriculars.users.classes?.name || 'Tidak ada kelas'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {attendance.student_extracurriculars.extracurriculars.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {attendance.check_in_time ? 
                          new Date(attendance.check_in_time).toLocaleTimeString('id-ID', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          }) : 
                          '-'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          attendance.status === 'hadir' ? 'bg-green-100 text-green-800' :
                          attendance.status === 'izin' ? 'bg-yellow-100 text-yellow-800' :
                          attendance.status === 'sakit' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {attendance.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {attendance.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
      </div>
  </div>
  );
}
  



// The main page component that renders the content wrapped in Suspense
export default function LihatEkstrakurikulerSiswaPage() {
  return (
    <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="text-blue-600 text-lg">Memuat halaman Ekstrakurikuler Siswa...</div>
        </div>
    }>
      <LihatEkstrakurikulerSiswaContent />
    </Suspense>
  );
}
