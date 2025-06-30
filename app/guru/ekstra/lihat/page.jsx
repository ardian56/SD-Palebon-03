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
  const [studentsScheduleData, setStudentsScheduleData] = useState([]);
  const [activeTab, setActiveTab] = useState('status'); // 'status', 'jadwal'
  const [filterClassId, setFilterClassId] = useState(null); // Used by regular guru
  const [isSuperAdminViewingAll, setIsSuperAdminViewingAll] = useState(false); // Used by super admin

  // Function to fetch schedule data for students
  const fetchStudentsScheduleData = async (studentsData, classFilter, isViewingAll) => {
    try {
      console.log('Guru: Starting fetchStudentsScheduleData...');
      
      // Get only finalized students
      const finalizedStudents = studentsData.filter(student => student.extracurricular_finalized);
      console.log('Guru: Finalized students:', finalizedStudents.length);
      
      if (finalizedStudents.length === 0) {
        console.log('Guru: No finalized students found');
        setStudentsScheduleData([]);
        return;
      }

      // Get student IDs for finalized students
      const finalizedStudentIds = finalizedStudents.map(student => student.id);
      console.log('Guru: Finalized student IDs:', finalizedStudentIds);

      // Step 1: Get student-extracurricular relationships (correct field name)
      console.log('Guru: Querying student_extracurriculars table...');
      const { data: studentExtras, error: studentExtrasError } = await supabase
        .from('student_extracurriculars')
        .select('user_id, extracurricular_id')
        .in('user_id', finalizedStudentIds);

      if (studentExtrasError) {
        console.error('Error fetching student extracurriculars:', studentExtrasError);
        console.error('Error details:', JSON.stringify(studentExtrasError, null, 2));
        return;
      }

      console.log('Guru: Student extracurriculars data:', studentExtras);

      if (!studentExtras || studentExtras.length === 0) {
        console.log('Guru: No student extracurriculars found');
        setStudentsScheduleData([]);
        return;
      }

      // Normalize data structure (rename user_id to student_id for consistency)
      const normalizedStudentExtras = studentExtras.map(item => ({
        student_id: item.user_id,
        extracurricular_id: item.extracurricular_id
      }));

      // Continue with normal processing
      await processScheduleData(normalizedStudentExtras, finalizedStudentIds);
      
    } catch (error) {
      console.error('Error in fetchStudentsScheduleData:', error);
    }
  };

  // Separate function to process schedule data
  const processScheduleData = async (studentExtras, finalizedStudentIds) => {
    try {

      // Step 2: Get student names and classes separately
      const { data: students, error: studentsError } = await supabase
        .from('users')
        .select('id, name, classes(name)')
        .in('id', finalizedStudentIds);

      if (studentsError) {
        console.error('Error fetching students:', studentsError);
        return;
      }

      console.log('Guru: Students data:', students);

      // Step 3: Get unique extracurricular IDs and their names
      const extraIds = [...new Set(studentExtras.map(se => se.extracurricular_id))];
      console.log('Guru: Unique extracurricular IDs:', extraIds);

      const { data: extracurriculars, error: extrasError } = await supabase
        .from('extracurriculars')
        .select('id, name')
        .in('id', extraIds);

      if (extrasError) {
        console.error('Error fetching extracurriculars:', extrasError);
        return;
      }

      console.log('Guru: Extracurriculars data:', extracurriculars);

      // Step 4: Get schedules for these extracurriculars
      const { data: schedules, error: schedulesError } = await supabase
        .from('extracurricular_schedules')
        .select('extracurricular_id, day_of_week, start_time, end_time')
        .in('extracurricular_id', extraIds);

      if (schedulesError) {
        console.error('Error fetching schedules:', schedulesError);
        return;
      }

      console.log('Guru: Schedules data:', schedules);

      // Step 5: Process and combine data
      const processedScheduleData = {};
      
      // Create student lookup maps
      const studentMap = new Map(students.map(s => [s.id, s]));
      const extraMap = new Map(extracurriculars.map(e => [e.id, e]));
      
      studentExtras.forEach(item => {
        const studentId = item.student_id;
        const extraId = item.extracurricular_id;
        
        const student = studentMap.get(studentId);
        const extra = extraMap.get(extraId);
        
        if (!student || !extra) return;

        const studentName = student.name;
        const className = student.classes?.name;
        const extraName = extra.name;

        if (!processedScheduleData[studentId]) {
          processedScheduleData[studentId] = {
            id: studentId,
            name: studentName,
            className: className || 'Tidak ada kelas',
            schedules: []
          };
        }

        // Find schedules for this extracurricular
        const extraSchedules = schedules ? schedules.filter(s => s.extracurricular_id === extraId) : [];
        
        extraSchedules.forEach(schedule => {
          const dayOfWeek = schedule.day_of_week;
          const startTime = schedule.start_time;
          const endTime = schedule.end_time;

          if (extraName && dayOfWeek !== null && startTime && endTime) {
            const dayNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
            processedScheduleData[studentId].schedules.push({
              extraName,
              day: dayNames[dayOfWeek] || 'Tidak diketahui',
              startTime,
              endTime
            });
          }
        });
      });

      console.log('Guru: Processed schedule data:', processedScheduleData);

      // Convert to array and sort schedules
      const scheduleArray = Object.values(processedScheduleData).map(student => ({
        ...student,
        schedules: student.schedules.sort((a, b) => {
          const dayOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
          return dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
        })
      }));

      console.log('Guru: Final schedule array:', scheduleArray);
      setStudentsScheduleData(scheduleArray);
    } catch (error) {
      console.error('Error in processScheduleData:', error);
    }
  };


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

      // Fetch schedule data for finalized students
      await fetchStudentsScheduleData(studentsToFetch, currentClassFilter, viewingAll);
      
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
      <div className="mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('status')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'status'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Status Ekstrakurikuler
          </button>
          <button
            onClick={() => setActiveTab('jadwal')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'jadwal'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Jadwal Siswa
          </button>
        </nav>
      </div>

      {studentsExtracurricularData.length === 0 ? (
        <p className="text-gray-500">Tidak ada data siswa ditemukan.</p>
      ) : (
        <>
          {/* Tab Content */}
          {activeTab === 'status' && (
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

          {activeTab === 'jadwal' && (
            <div className="bg-white rounded-lg shadow-md p-4">
              {studentsScheduleData.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Tidak ada siswa yang sudah finalisasi pilihan ekstrakurikuler.
                </p>
              ) : (
                <div className="overflow-x-auto">
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
                          Jadwal Ekstrakurikuler
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {studentsScheduleData.map((student) => (
                        <tr key={student.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {student.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.className}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {student.schedules.length > 0 ? (
                              <div className="space-y-2">
                                {student.schedules.map((schedule, index) => (
                                  <div key={index} className="bg-blue-50 p-2 rounded border-l-4 border-blue-400">
                                    <div className="font-semibold text-blue-800">{schedule.extraName}</div>
                                    <div className="text-sm text-blue-600">
                                      {schedule.day}, {schedule.startTime} - {schedule.endTime}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400 italic">Tidak ada jadwal</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
