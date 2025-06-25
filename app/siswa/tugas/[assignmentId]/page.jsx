// app/siswa/tugas/[assignmentId]/page.jsx
"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '../../../../lib/supabaseClient'; // Sesuaikan path sesuai struktur proyek Anda

// Definisi komponen utama yang menggunakan hooks klien (useRouter, useParams)
function AssignmentDetailContent() {
  const router = useRouter();
  const supabase = createClient();
  const params = useParams();
  const assignmentId = params.assignmentId;

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [message, setMessage] = useState('');

  const [submissionText, setSubmissionText] = useState('');
  const [submissionFile, setSubmissionFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchAssignmentAndSubmission = async () => {
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

      if (profileError || profile?.role !== 'siswa' || !profile.class_id) {
        setMessage('Akses ditolak: Anda bukan siswa atau belum ditugaskan ke kelas.');
        await supabase.auth.signOut();
        router.push('/');
        return;
      }
      setUserData(profile);

      const { data: fetchedAssignment, error: assignmentError } = await supabase
        .from('assignments')
        .select('*, assignment_files(file_url, file_name, file_type)')
        .eq('id', assignmentId)
        .eq('class_id', profile.class_id)
        .single();

      if (assignmentError) {
        if (assignmentError.code === 'PGRST116') {
          setMessage('Tugas tidak ditemukan atau tidak tersedia untuk kelas Anda.');
        } else {
          setMessage('Error fetching assignment details: ' + assignmentError.message);
        }
        setLoading(false);
        return;
      }
      setAssignment(fetchedAssignment);

      const { data: existingSubmission, error: submissionError } = await supabase
        .from('student_submissions')
        .select('*')
        .eq('assignment_id', assignmentId)
        .eq('user_id', session.user.id)
        .single();

      if (submissionError && submissionError.code !== 'PGRST116') {
        console.error('Error fetching existing submission:', submissionError);
      } else if (existingSubmission) {
        setSubmission(existingSubmission);
        setSubmissionText(existingSubmission.submission_text || '');
      }

      setLoading(false);
    };

    if (assignmentId) {
      fetchAssignmentAndSubmission();
    }

    const assignmentSubscription = supabase
      .channel(`assignment_${assignmentId}_changes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'assignments', filter: `id=eq.${assignmentId}` },
        payload => {
          console.log('Assignment update received!', payload);
          fetchAssignmentAndSubmission();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'student_submissions', filter: `assignment_id=eq.${assignmentId}` },
        payload => {
          if (payload.new.user_id === user?.id || payload.old?.user_id === user?.id) {
            console.log('Submission update received!', payload);
            fetchAssignmentAndSubmission();
          }
        }
      )
      .subscribe();

    return () => {
      assignmentSubscription.unsubscribe();
    };
  }, [router, supabase, assignmentId, user?.id]);

  const handleFileChange = (e) => {
    setSubmissionFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setMessage('');

    // If submission is already finalized, prevent further changes
    if (submission?.is_finalized) {
      setMessage('Pengumpulan sudah difinalisasi dan tidak dapat diubah.');
      setUploading(false);
      return;
    }

    if (!submissionText && !submissionFile && !submission?.file_url && !submission?.submission_text) {
      setMessage('Harap masukkan teks atau unggah file untuk mengumpulkan tugas.');
      setUploading(false);
      return;
    }

    if (!user || !assignment) {
      setMessage('Autentikasi gagal atau tugas tidak valid.');
      setUploading(false);
      return;
    }

    let fileUrl = submission?.file_url || null;
    let fileName = submission?.file_name || null;
    let fileType = submission?.file_type || null;

    try {
      if (submissionFile) {
        const fileExtension = submissionFile.name.split('.').pop();
        const path = `student_submissions/${user.id}/${assignment.id}_${Date.now()}_${submissionFile.name}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('attach') // Menggunakan bucket 'attach'
          .upload(path, submissionFile, {
            cacheControl: '3600',
            upsert: true,
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
          .from('attach') // Menggunakan bucket 'attach'
          .getPublicUrl(path);

        if (!publicUrlData || publicUrlData.error) {
            throw publicUrlData.error || new Error('Tidak dapat mendapatkan URL publik untuk file yang diunggah.');
        }

        fileUrl = publicUrlData.publicUrl;
        fileName = submissionFile.name;
        fileType = submissionFile.type;
      } else if (submission && !submissionText && !submissionFile) {
        // Jika tidak ada file baru dan teks dihilangkan, asumsikan file lama juga dihilangkan jika itu satu-satunya konten
        // Ini adalah asumsi, jika Anda ingin mempertahankan file lama bahkan jika teks dihilangkan, Anda bisa hapus 'else if' ini
        if (!submission.submission_text && submission.file_url) {
            fileUrl = null;
            fileName = null;
            fileType = null;
        }
      }


      const submissionData = {
        assignment_id: assignment.id,
        user_id: user.id,
        submission_text: submissionText,
        file_url: fileUrl,
        file_name: fileName,
        file_type: fileType,
        submitted_at: new Date().toISOString(),
        // is_finalized will be handled by handleFinalizeSubmission
      };

      if (submission) {
        const { error: updateError } = await supabase
          .from('student_submissions')
          .update(submissionData)
          .eq('id', submission.id);

        if (updateError) {
          throw updateError;
        }
        setMessage('Tugas berhasil diperbarui!');
      } else {
        const { error: insertError } = await supabase
          .from('student_submissions')
          .insert(submissionData);

        if (insertError) {
          throw insertError;
        }
        setMessage('Tugas berhasil dikumpulkan!');
      }

      const { data: updatedSubmission, error: fetchUpdatedError } = await supabase
        .from('student_submissions')
        .select('*')
        .eq('assignment_id', assignmentId)
        .eq('user_id', user.id)
        .single();
      if (!fetchUpdatedError) {
        setSubmission(updatedSubmission);
      }

    } catch (error) {
      console.error('Pengumpulan gagal:', error.message);
      setMessage('Gagal mengumpulkan tugas: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleFinalizeSubmission = async () => {
    setUploading(true);
    setMessage('');

    if (!submission || submission.is_finalized) {
      setMessage('Pengumpulan belum ada atau sudah difinalisasi.');
      setUploading(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('student_submissions')
        .update({ is_finalized: true })
        .eq('id', submission.id)
        .eq('user_id', user.id); // Ensure only current user can finalize their own submission

      if (error) {
        throw error;
      }
      setMessage('Pengumpulan berhasil difinalisasi!');
      // Update local state to reflect finalization
      setSubmission(prev => ({ ...prev, is_finalized: true }));
    } catch (error) {
      console.error('Gagal finalisasi pengumpulan:', error.message);
      setMessage('Gagal finalisasi pengumpulan: ' + error.message);
    } finally {
      setUploading(false);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-blue-600 text-lg">Memuat detail tugas...</div>
      </div>
    );
  }

  if (message && !assignment) {
    return (
      <div className="container mx-auto p-4 md:p-8 max-w-4xl font-sans">
        <p className="mb-4 p-3 rounded bg-red-100 text-red-700">
          {message}
        </p>
        <Link href="/siswa/tugas" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            &larr; Kembali ke Daftar Tugas
        </Link>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="container mx-auto p-4 md:p-8 max-w-4xl font-sans">
        <p className="mb-4 p-3 rounded bg-red-100 text-red-700">
          Tugas tidak ditemukan atau tidak tersedia.
        </p>
        <Link href="/siswa/tugas" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            &larr; Kembali ke Daftar Tugas
        </Link>
      </div>
    );
  }

  const isOverdue = new Date(assignment.due_date) < new Date();
  const isFinalized = submission?.is_finalized; // Get finalization status

  // Determine if the form should be disabled (either overdue or finalized)
  const formDisabled = uploading || isOverdue || isFinalized;

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl font-sans">
      <Link href="/siswa/tugas" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Kembali ke Daftar Tugas
      </Link>

      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        {assignment.title}
        {isOverdue && (
            <span className="ml-4 inline-flex items-center rounded-full bg-red-100 px-3 py-0.5 text-sm font-medium text-red-800">
                Tenggat Terlewati
            </span>
        )}
      </h1>

      {message && (
        <p className={`mb-4 p-3 rounded ${message.includes('Gagal') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </p>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <p className="text-gray-700 mb-4">{assignment.description}</p>
        <p className="text-gray-600 text-sm mb-1">Mata Pelajaran: <span className="font-medium">{assignment.subject}</span></p>
        <p className="text-gray-600 text-sm mb-1">Tenggat Pengumpulan: <span className="font-medium">{new Date(assignment.due_date).toLocaleString()}</span></p>
        <p className="text-gray-600 text-sm mb-1">Dibuat Oleh: <span className="font-medium">{assignment.created_by}</span></p>

        {assignment.assignment_files && assignment.assignment_files.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Lampiran Tugas:</h3>
            <ul className="list-disc list-inside space-y-1">
              {assignment.assignment_files.map((file, index) => (
                <li key={index}>
                  <a href={file.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {file.file_name} ({file.file_type})
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Pengumpulan Tugas</h2>

        {submission ? (
          <div className="mb-4 p-4 border border-blue-200 rounded-md bg-blue-50">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Anda Sudah Mengumpulkan:</h3>
            <p className="text-gray-700">
              <strong>Teks:</strong> {submission.submission_text || 'Tidak ada teks.'}
            </p>
            {submission.file_url && (
              <p className="text-gray-700 mt-2">
                <strong>File:</strong>{' '}
                <a href={submission.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {submission.file_name || 'Lihat File'}
                </a> ({submission.file_type})
              </p>
            )}
            <p className="text-gray-600 text-sm mt-2">
              Dikumpulkan pada: {new Date(submission.submitted_at).toLocaleString()}
            </p>
            {submission.grade !== null && (
                <p className="text-gray-800 font-bold text-lg mt-2">Nilai: <span className="text-purple-700">{submission.grade}</span></p>
            )}
            {submission.feedback && (
                <p className="text-gray-700 mt-2">Feedback Guru: <span className="italic">"{submission.feedback}"</span></p>
            )}
            {!isOverdue && !isFinalized && ( // Pesan untuk pembaruan
                <p className="text-sm text-blue-700 mt-3">
                    Anda dapat memperbarui pengumpulan ini kapan saja sebelum tenggat waktu.
                </p>
            )}
            {isFinalized && ( // Pesan jika sudah difinalisasi
              <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 mt-4" role="alert">
                <p className="font-bold">Pengumpulan Anda Sudah Difinalisasi!</p>
                <p>Pengumpulan ini tidak dapat lagi diubah. Silakan hubungi guru Anda jika ada perubahan mendesak.</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500 mb-4">Anda belum mengumpulkan tugas ini.</p>
        )}

        {/* Form Pengumpulan */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="submissionText" className="block text-sm font-medium text-gray-700 mb-1">
              Teks Pengumpulan (Opsional)
            </label>
            <textarea
              id="submissionText"
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              rows="4"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Tuliskan jawaban atau komentar Anda di sini..."
              disabled={formDisabled}
            ></textarea>
          </div>

          <div>
            <label htmlFor="submissionFile" className="block text-sm font-medium text-gray-700 mb-1">
              Unggah File (Opsional)
            </label>
            <input
              type="file"
              id="submissionFile"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500
                         file:mr-4 file:py-2 file:px-4
                         file:rounded-full file:border-0
                         file:text-sm file:font-semibold
                         file:bg-blue-50 file:text-blue-700
                         hover:file:bg-blue-100"
              disabled={formDisabled}
            />
            {submissionFile && (
              <p className="mt-2 text-sm text-gray-600">File terpilih: {submissionFile.name}</p>
            )}
            {submission && submission.file_url && !submissionFile && (
                <p className="mt-2 text-sm text-gray-600">File yang sudah diunggah: <a href={submission.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{submission.file_name}</a> (Akan diganti jika Anda mengunggah file baru.)</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            disabled={formDisabled}
          >
            {uploading ? 'Mengunggah & Mengumpulkan...' : (submission ? 'Perbarui Pengumpulan' : 'Kumpulkan Tugas')}
          </button>
          {isOverdue && (
            <p className="text-center text-red-600 text-sm mt-2">Tenggat pengumpulan sudah terlewati. Anda tidak bisa mengumpulkan tugas ini lagi.</p>
          )}
        </form>

        {/* Tombol Finalisasi */}
        {submission && !isOverdue && !isFinalized && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={handleFinalizeSubmission}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              disabled={uploading}
            >
              {uploading ? 'Memfinalisasi...' : 'Finalisasi Pengumpulan'}
            </button>
            <p className="text-center text-gray-500 text-sm mt-2">
              Setelah difinalisasi, Anda tidak dapat lagi mengubah pengumpulan ini.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SiswaTugasDetailPage() {
  return (
    <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="text-blue-600 text-lg">Memuat detail tugas...</div>
        </div>
    }>
      <AssignmentDetailContent />
    </Suspense>
  );
}
