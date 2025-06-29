// app/guru/tugas/nilai/[assignmentId]/[studentId]/page.jsx
"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabaseClient'; // Sesuaikan path

// Komponen utama untuk halaman penilaian
function NilaiTugasContent() {
  const router = useRouter();
  const supabase = createClient();
  const params = useParams();
  const assignmentId = params.assignmentId;
  const studentId = params.studentId;

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null); // Data profil guru
  const [assignment, setAssignment] = useState(null);
  const [student, setStudent] = useState(null); // Data siswa yang pengumpulannya dinilai
  const [submission, setSubmission] = useState(null); // Pengumpulan siswa yang sedang dinilai
  const [message, setMessage] = useState('');

  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');

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
        .select('*, classes(name), users!assignments_created_by_fkey(name)')
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

      // Ambil detail siswa
      const { data: fetchedStudent, error: studentError } = await supabase
        .from('users')
        .select('id, name, class_id')
        .eq('id', studentId)
        .eq('role', 'siswa')
        .single();

      if (studentError) {
        setMessage('Siswa tidak ditemukan: ' + studentError.message);
        setLoading(false);
        return;
      }
      // Pastikan siswa ini berada di kelas yang sesuai dengan tugas (penting untuk RLS)
      if (fetchedStudent.class_id !== fetchedAssignment.class_id) {
          setMessage('Siswa ini tidak berada di kelas tugas yang relevan.');
          setLoading(false);
          return;
      }
      setStudent(fetchedStudent);

      // Ambil pengumpulan tugas siswa
      const { data: fetchedSubmission, error: submissionError } = await supabase
        .from('student_submissions')
        .select('*')
        .eq('assignment_id', assignmentId)
        .eq('user_id', studentId)
        .single();

      if (submissionError) {
        if (submissionError.code === 'PGRST116') {
          setMessage('Siswa ini belum mengumpulkan tugas ini.');
          setSubmission(null); // Pastikan submission null jika belum ada
        } else {
          setMessage('Error fetching submission: ' + submissionError.message);
        }
        // Jangan return, tetap tampilkan tugas dan siswa meskipun belum ada submission
      } else {
        setSubmission(fetchedSubmission);
        setGrade(fetchedSubmission.grade || '');
        setFeedback(fetchedSubmission.feedback || '');
      }

      setLoading(false);
    };

    if (assignmentId && studentId) {
      fetchData();
    }

    // Real-time listener untuk pengumpulan spesifik ini
    const submissionChanges = supabase
      .channel(`submission_grade_changes_${assignmentId}_${studentId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'student_submissions', filter: `assignment_id=eq.${assignmentId}` },
        payload => {
          if (payload.new.user_id === studentId) {
            console.log('Submission update detected for this student!', payload);
            fetchData(); // Reload data when submission changes
          }
        }
      )
      .subscribe();

    return () => {
      submissionChanges.unsubscribe();
    };

  }, [router, supabase, assignmentId, studentId, user?.id]);


  const handleGradeSubmission = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!submission) {
      setMessage('Tidak ada pengumpulan untuk dinilai.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('student_submissions')
        .update({
          grade: grade === '' ? null : parseInt(grade, 10), // Set to null if empty, parse as int
          feedback: feedback,
        })
        .eq('id', submission.id)
        .eq('assignment_id', assignmentId)
        .eq('user_id', studentId); // Pastikan guru menilai pengumpulan yang benar

      if (error) {
        throw error;
      }
      setMessage('Nilai dan umpan balik berhasil disimpan!');
      // Muat ulang pengumpulan untuk memastikan UI update
      const { data: updatedSubmission } = await supabase
        .from('student_submissions')
        .select('*')
        .eq('id', submission.id)
        .single();
      setSubmission(updatedSubmission);

    } catch (error) {
      console.error('Gagal menyimpan nilai:', error.message);
      setMessage('Gagal menyimpan nilai: ' + error.message);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-blue-600 text-lg">Memuat halaman penilaian tugas...</div>
      </div>
    );
  }

  if (message && (!assignment || !student)) {
    return (
      <div className="container mx-auto p-4 md:p-8 max-w-4xl font-sans">
        <p className="mb-4 p-3 rounded bg-red-100 text-red-700">
          {message}
        </p>
        <Link href={`/guru/tugas/lihat-pengumpulan/${assignmentId}`} className="inline-flex items-center text-blue-600 hover:text-blue-800 mt-4">
            &larr; Kembali ke Daftar Pengumpulan
        </Link>
      </div>
    );
  }

  if (!assignment || !student) {
      return null; // Akan ditangani oleh pesan error di atas
  }

  return (
    <div className="w-full bg-gray-100">
      <div className="container mx-auto p-4 md:p-8 max-w-4xl font-sans">
      <Link href={`/guru/tugas/lihat-pengumpulan/${assignmentId}`} className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Kembali ke Daftar Pengumpulan
      </Link>

      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Nilai Tugas: "{assignment.title}"
      </h1>
      <p className="text-gray-600 mb-2">
        Untuk Siswa: <span className="font-medium">{student.name}</span>
      </p>
      <p className="text-gray-600 mb-6">
        Kelas: <span className="font-medium">{assignment.classes?.name || 'N/A'}</span>
      </p>

      {message && (
        <p className={`mb-4 p-3 rounded ${message.includes('Gagal') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </p>
      )}

      {/* Detail Pengumpulan Siswa */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Detail Pengumpulan Siswa</h2>
        {submission ? (
          <>
            <p className="text-gray-700 mb-2">
              <strong>Teks Pengumpulan:</strong> {submission.submission_text || 'Tidak ada teks pengumpulan.'}
            </p>
            {submission.file_url && (
              <p className="text-gray-700 mb-2">
                <strong>Lampiran File:</strong>{' '}
                <a href={submission.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {submission.file_name || 'Lihat File'} ({submission.file_type})
                </a>
              </p>
            )}
            <p className="text-gray-600 text-sm">
              Dikumpulkan pada: {new Date(submission.submitted_at).toLocaleString()}
            </p>
            {submission.is_finalized && (
              <span className="mt-2 inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800">
                Sudah Difinalisasi oleh Siswa
              </span>
            )}
          </>
        ) : (
          <p className="text-gray-500">Siswa ini belum mengumpulkan tugas ini.</p>
        )}
      </div>

      {/* Form Penilaian */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Berikan Nilai & Umpan Balik</h2>
        <form onSubmit={handleGradeSubmission} className="space-y-4">
          <div>
            <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">
              Nilai (Angka, 0-100)
            </label>
            <input
              type="number"
              id="grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              min="0"
              max="100"
              disabled={loading || !submission} // Nonaktifkan jika loading atau belum ada pengumpulan
            />
          </div>
          <div>
            <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1">
              Umpan Balik (Opsional)
            </label>
            <textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows="4"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Berikan umpan balik kepada siswa..."
              disabled={loading || !submission} // Nonaktifkan jika loading atau belum ada pengumpulan
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={loading || !submission} // Nonaktifkan jika loading atau belum ada pengumpulan
          >
            {loading ? 'Menyimpan...' : 'Simpan Nilai & Umpan Balik'}
          </button>
          {!submission && (
            <p className="text-center text-gray-500 text-sm mt-2">Anda hanya dapat menilai tugas yang sudah dikumpulkan.</p>
          )}
        </form>
      </div>
    </div>
    </div>
  );
}

export default function NilaiTugasPage() {
  return (
    <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="text-blue-600 text-lg">Memuat halaman penilaian tugas...</div>
        </div>
    }>
      <NilaiTugasContent />
    </Suspense>
  );
}
