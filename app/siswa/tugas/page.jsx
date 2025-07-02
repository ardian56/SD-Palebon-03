// app/siswa/tugas/page.jsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '../../../lib/supabaseClient'; // Adjust path

export default function SiswaTugasPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null); // Student's profile data
  const [mapelData, setMapelData] = useState([]); // Data mata pelajaran dengan tugas
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setMessage('');

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (!session || sessionError) {
        console.log('No session or session error, redirecting to signin.');
        router.push('/auth/signin');
        return;
      }

      setUser(session.user);

      // Fetch user profile to get their class_id
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('name, role, class_id, classes(name)') // Include classes(name) for display on student page
        .eq('id', session.user.id)
        .single();

      if (profileError || profile?.role !== 'siswa' || !profile.class_id) {
        console.log('Profile error, not a student, or class_id is missing:', profileError || profile);
        setMessage('Akses ditolak: Anda bukan siswa atau belum ditugaskan ke kelas.');
        await supabase.auth.signOut();
        router.push('/');
        return;
      }
      setUserData(profile);
      console.log('Siswa Class ID:', profile.class_id); // Debug log
      console.log('Siswa Class Name:', profile.classes?.name); // Debug log

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

      // Untuk setiap mata pelajaran, ambil tugas di kelas ini beserta status pengumpulan
      const mapelWithAssignments = await Promise.all(
        mapel.map(async (m) => {
          // Ambil tugas untuk mapel ini di kelas siswa
          const { data: assignments, error: assignmentsError } = await supabase
            .from('assignments')
            .select('*, assignment_files(file_url, file_name)') // Select assignment details and linked files
            .eq('mapel_id', m.id) // Filter berdasarkan mapel_id
            .eq('class_id', profile.class_id) // Filter berdasarkan kelas siswa
            .order('due_date', { ascending: true }); // Order by due date

          if (assignmentsError) {
            console.error(`Error fetching assignments for ${m.name}:`, assignmentsError.message);
            return {
              ...m,
              assignments: [],
              assignmentCount: 0,
            };
          }

          // Untuk setiap assignment, cek status pengumpulan siswa
          const assignmentsWithSubmissionStatus = await Promise.all(
            assignments.map(async (assignment) => {
              const { data: submission, error: submissionError } = await supabase
                .from('student_submissions')
                .select('id')
                .eq('assignment_id', assignment.id)
                .eq('user_id', session.user.id)
                .single();

              if (submissionError && submissionError.code !== 'PGRST116') { // PGRST116 means no row found
                console.error('Error checking submission status for assignment', assignment.id, ':', submissionError);
                // Don't block the UI, just log the error
              }

              return {
                ...assignment,
                hasSubmitted: !!submission, // true if submission exists, false otherwise
              };
            })
          );

          return {
            ...m,
            assignments: assignmentsWithSubmissionStatus,
            assignmentCount: assignmentsWithSubmissionStatus.length,
          };
        })
      );

      // Filter hanya mapel yang memiliki tugas
      const mapelWithAssignmentsFiltered = mapelWithAssignments.filter(m => m.assignmentCount > 0);

      setMapelData(mapelWithAssignmentsFiltered);
      setLoading(false);
    };

    fetchData();


    // Real-time listener for assignments relevant to the student's class
    // This assumes RLS allows students to read changes to assignments for their class
    const assignmentSubscription = supabase
      .channel('assignments_for_student_class_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assignments',
          // Filter untuk kelas siswa
          filter: `class_id=eq.${userData?.class_id || 'NULL'}` // Gunakan 'NULL' sebagai fallback
        },
        payload => {
          console.log('Assignment change received!', payload);
          fetchData(); // Re-fetch data on changes
        }
      )
      .on( // Also listen for new submissions
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'student_submissions',
          filter: `user_id=eq.${user?.id || 'NULL'}` // Gunakan 'NULL' sebagai fallback
        },
        payload => {
          console.log('New submission received!', payload);
          fetchData(); // Re-fetch to update submission status
        }
      )
      .on( // And updates to submissions (e.g., teacher grades)
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'student_submissions',
          filter: `user_id=eq.${user?.id || 'NULL'}` // Gunakan 'NULL' sebagai fallback
        },
        payload => {
          console.log('Submission update received!', payload);
          fetchData(); // Re-fetch to update submission status or grade
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
      assignmentSubscription.unsubscribe();
    };
  }, [router, supabase, user?.id, userData?.class_id]); // Add userData.class_id to dependencies

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-blue-600 text-lg">Memuat daftar tugas...</div>
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

      <h1 className="text-3xl font-bold mb-6 text-gray-800">Tugas Anda</h1>
      <p className="text-gray-600 mb-6">
        Halo <span className="font-medium">{userData?.name || 'Siswa'}</span>, berikut adalah daftar tugas untuk kelas Anda (<span className="font-medium">{userData?.classes?.name || 'Tidak ada kelas'}</span>), dikelompokkan per mata pelajaran.
      </p>

      {mapelData.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-500 mb-2">Belum Ada Tugas</h3>
          <p className="text-gray-400">Tugas belum diberikan untuk kelas Anda.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {mapelData.map((mapel) => (
            <div key={mapel.id} className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 rounded-2xl shadow-lg p-8 relative overflow-hidden">
              {/* Background decorative element */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/20 to-indigo-300/20 rounded-full -translate-y-16 translate-x-16"></div>
              
              <div className="relative z-10 flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 text-blue-600">
                    <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">{mapel.name}</h2>
                </div>
                <span className="bg-blue-200 text-blue-800 text-sm font-bold px-4 py-2 rounded-full shadow-sm">
                  {mapel.assignmentCount} Tugas
                </span>
              </div>
              
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mapel.assignments.map((assignment) => (
                  <div key={assignment.id} className="bg-white p-6 rounded-xl border hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-800 flex-1 mr-2">{assignment.title}</h3>
                      <div className="h-6 w-6 text-orange-500 flex-shrink-0">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4">
                      <span className="font-medium">Tenggat:</span> {new Date(assignment.due_date).toLocaleString()}
                    </p>

                    <div className="mb-4">
                      {assignment.hasSubmitted ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                          <svg className="-ml-1 mr-1.5 h-3 w-3 text-green-500" fill="currentColor" viewBox="0 0 8 8">
                            <circle cx={4} cy={4} r={3} />
                          </svg>
                          Sudah Dikumpulkan
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
                          <svg className="-ml-1 mr-1.5 h-3 w-3 text-yellow-500" fill="currentColor" viewBox="0 0 8 8">
                            <circle cx={4} cy={4} r={3} />
                          </svg>
                          Belum Dikumpulkan
                        </span>
                      )}
                    </div>

                    <Link href={`/siswa/tugas/${assignment.id}`} className="inline-flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-3 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg">
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Lihat Detail & Kumpulkan
                    </Link>
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
