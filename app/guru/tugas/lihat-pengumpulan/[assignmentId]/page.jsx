// app/guru/tugas/lihat-pengumpulan/[assignmentId]/page.jsx
"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabaseClient'; // Sesuaikan path

// Komponen utama untuk melihat pengumpulan per tugas
function LihatPengumpulanContent() {
  const router = useRouter();
  const supabase = createClient();
  const params = useParams();
  const assignmentId = params.assignmentId;

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [studentsWithSubmissionStatus, setStudentsWithSubmissionStatus] = useState([]);
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
        .select('name, role, class_id')
        .eq('id', session.user.id)
        .single();

      if (profileError || (!['guru', 'super_admin'].includes(profile?.role))) {
        setMessage('Akses ditolak: Anda tidak memiliki izin untuk melihat halaman ini.');
        await supabase.auth.signOut();
        router.push('/');
        return;
      }
      setUserData(profile);

      // Ambil detail tugas
      const { data: fetchedAssignment, error: assignmentError } = await supabase
        .from('assignments')
        .select('*, classes(name), users!assignments_created_by_fkey(name)') // Join untuk nama kelas dan nama guru
        .eq('id', assignmentId)
        .single();

      if (assignmentError) {
        if (assignmentError.code === 'PGRST116') {
          setMessage('Tugas tidak ditemukan.');
        } else {
          setMessage('Error fetching assignment details: ' + assignmentError.message);
        }
        setLoading(false);
        return;
      }

      // Validasi akses guru ke tugas ini
      if (profile.role === 'guru' && fetchedAssignment.created_by !== session.user.id) {
          setMessage('Akses ditolak: Anda tidak membuat tugas ini.');
          setLoading(false);
          return;
      }
      setAssignment(fetchedAssignment);

      // Ambil semua siswa di kelas tugas ini
      const { data: students, error: studentsError } = await supabase
        .from('users')
        .select('id, name')
        .eq('role', 'siswa')
        .eq('class_id', fetchedAssignment.class_id);

      if (studentsError) {
        setMessage('Error fetching students: ' + studentsError.message);
        setLoading(false);
        return;
      }

      // Ambil semua pengumpulan untuk tugas ini
      const { data: submissions, error: submissionsError } = await supabase
        .from('student_submissions')
        .select('*')
        .eq('assignment_id', assignmentId);

      if (submissionsError) {
        setMessage('Error fetching submissions: ' + submissionsError.message);
        setLoading(false);
        return;
      }

      // Gabungkan data siswa dengan status pengumpulan
      const processedStudents = students.map(student => {
        const studentSubmission = submissions.find(sub => sub.user_id === student.id);
        return {
          id: student.id,
          name: student.name,
          hasSubmitted: !!studentSubmission,
          submission: studentSubmission || null, // Sertakan objek pengumpulan penuh jika ada
        };
      });
      setStudentsWithSubmissionStatus(processedStudents);
      setLoading(false);
    };

    if (assignmentId) {
      fetchData();
    }

    // Real-time listener untuk pengumpulan tugas ini
    const submissionChanges = supabase
      .channel(`assignment_${assignmentId}_submissions_changes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'student_submissions', filter: `assignment_id=eq.${assignmentId}` },
        payload => {
          console.log('Submission change for this assignment detected!', payload);
          fetchData(); // Muat ulang data saat ada perubahan pengumpulan
        }
      )
      .subscribe();

    return () => {
      submissionChanges.unsubscribe();
    };

  }, [router, supabase, assignmentId, user?.id]); // Pastikan assignmentId dan user?.id di dependencies

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-blue-600 text-lg">Memuat detail pengumpulan tugas...</div>
      </div>
    );
  }

  if (message) {
    return (
      <div className="container mx-auto p-4 md:p-8 max-w-4xl font-sans">
        <p className="mb-4 p-3 rounded bg-red-100 text-red-700">
          {message}
        </p>
        <Link href="/guru/materi-dan-tugas" className="inline-flex items-center text-blue-600 hover:text-blue-800 mt-4">
            &larr; Kembali ke Materi & Tugas Kelas
        </Link>
      </div>
    );
  }

  if (!assignment) {
      return null; // Akan ditangani oleh pesan error di atas
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl font-sans">
      <Link href="/guru/materi-dan-tugas" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Kembali ke Materi & Tugas Kelas
      </Link>

      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Pengumpulan untuk Tugas: "{assignment.title}"
      </h1>
      <p className="text-gray-600 mb-2">
        Kelas: <span className="font-medium">{assignment.classes?.name || 'N/A'}</span>
      </p>
      <p className="text-gray-600 mb-6">
        Tenggat: <span className="font-medium">{new Date(assignment.due_date).toLocaleString()}</span>
      </p>

      {studentsWithSubmissionStatus.length === 0 ? (
        <p className="text-gray-500">Tidak ada siswa di kelas ini.</p>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {studentsWithSubmissionStatus.map((student) => (
              <div key={student.id} className="p-4 border border-gray-200 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{student.name}</h3>
                {student.hasSubmitted ? (
                  <>
                    <p className="text-sm text-green-700 font-medium flex items-center mb-1">
                      <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                      Sudah Mengumpulkan
                      {student.submission.is_finalized && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800">
                          Final
                        </span>
                      )}
                    </p>
                    {student.submission.submitted_at && (
                      <p className="text-gray-600 text-xs mb-1">
                        Pada: {new Date(student.submission.submitted_at).toLocaleString()}
                      </p>
                    )}
                    {student.submission.grade !== null && (
                      <p className="text-gray-800 font-bold mt-2">Nilai: <span className="text-purple-700">{student.submission.grade}</span></p>
                    )}
                    {student.submission.feedback && (
                      <p className="text-gray-700 mt-1">Feedback: <span className="italic">"{student.submission.feedback}"</span></p>
                    )}
                    <Link
                      href={`/guru/tugas/nilai/${assignmentId}/${student.id}`}
                      className="mt-3 inline-block bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
                    >
                      Lihat & Nilai
                    </Link>
                  </>
                ) : (
                  <p className="text-sm text-red-700 font-medium flex items-center">
                    <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>
                    Belum Mengumpulkan
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LihatPengumpulanPage() {
  return (
    <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="text-blue-600 text-lg">Memuat halaman pengumpulan...</div>
        </div>
    }>
      <LihatPengumpulanContent />
    </Suspense>
  );
}
