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
  const [assignments, setAssignments] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchAssignments = async () => {
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

      // Fetch assignments for the student's class
      const { data: fetchedAssignments, error: assignmentsError } = await supabase
        .from('assignments')
        .select('*, assignment_files(file_url, file_name)') // Select assignment details and linked files
        .eq('class_id', profile.class_id)
        .order('due_date', { ascending: true }); // Order by due date

      if (assignmentsError) {
        console.error('Error fetching assignments:', assignmentsError); // Debug log
        setMessage('Error fetching assignments: ' + assignmentsError.message);
        setLoading(false);
        return;
      }

      console.log('Fetched Assignments:', fetchedAssignments); // Debug log
      if (fetchedAssignments.length === 0) {
        console.log('No assignments found for this class.'); // Debug log
      }


      // For each assignment, check if the student has already submitted it
      const assignmentsWithSubmissionStatus = await Promise.all(
        fetchedAssignments.map(async (assignment) => {
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

      setAssignments(assignmentsWithSubmissionStatus);
      setLoading(false);
    };

    // --- PERBAIKAN DI SINI ---
    // Panggil fungsi fetchAssignments langsung.
    // Hapus baris 'if (assignmentId) { fetchAssignmentAndSubmission(); }'
    fetchAssignments();


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
          // Perbarui filter ini agar lebih robust saat `class_id` mungkin belum ada saat pertama kali mount
          filter: `class_id=eq.${userData?.class_id || 'NULL'}` // Gunakan 'NULL' sebagai fallback
        },
        payload => {
          console.log('Assignment change received!', payload);
          fetchAssignments(); // Re-fetch data on changes
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
          fetchAssignments(); // Re-fetch to update submission status
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
          fetchAssignments(); // Re-fetch to update submission status or grade
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
    <div className="container mx-auto p-4 md:p-8 max-w-4xl font-sans">
      <Link href="/siswa/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Kembali ke Dashboard
      </Link>

      <h1 className="text-3xl font-bold mb-6 text-gray-800">Tugas Anda</h1>
      <p className="text-gray-600 mb-6">
        Halo <span className="font-medium">{userData?.name || 'Siswa'}</span>, berikut adalah daftar tugas untuk kelas Anda (<span className="font-medium">{userData?.classes?.name || 'Tidak ada kelas'}</span>).
      </p>

      {assignments.length === 0 ? (
        <p className="text-gray-500">Belum ada tugas yang diberikan untuk kelas Anda.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map((assignment) => (
            <div key={assignment.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{assignment.title}</h2>
              <p className="text-gray-600 text-sm mb-1">Mata Pelajaran: <span className="font-medium">{assignment.subject}</span></p>
              <p className="text-gray-600 text-sm mb-3">Tenggat: <span className="font-medium">{new Date(assignment.due_date).toLocaleString()}</span></p>

              {assignment.hasSubmitted ? (
                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-0.5 text-sm font-medium text-green-800">
                  <svg className="-ml-1 mr-1.5 h-3 w-3 text-green-500" fill="currentColor" viewBox="0 0 8 8">
                    <circle cx={4} cy={4} r={3} />
                  </svg>
                  Sudah Dikumpulkan
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-0.5 text-sm font-medium text-yellow-800">
                  <svg className="-ml-1 mr-1.5 h-3 w-3 text-yellow-500" fill="currentColor" viewBox="0 0 8 8">
                    <circle cx={4} cy={4} r={3} />
                  </svg>
                  Belum Dikumpulkan
                </span>
              )}

              <Link href={`/siswa/tugas/${assignment.id}`} className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                Lihat Detail & Kumpulkan
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
