// app/guru/tugas/tambah/page.jsx
"use client";

import { useState, useEffect, Suspense } from 'react'; // Import Suspense
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabaseClient'; // Sesuaikan path

// Pindahkan komponen utama yang menggunakan useSearchParams ke fungsi terpisah
function AddAssignmentContent() { // Ubah nama fungsi komponen utama
  const router = useRouter();
  const searchParams = useSearchParams(); // Hook ini sekarang aman di dalam Suspense
  const supabase = createClient();

  const initialClassId = searchParams.get('classId') || ''; // Ambil classId dari URL

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null); // To store guru's class info
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [selectedClassId, setSelectedClassId] = useState(initialClassId); // Set initial classId
  const [dueDate, setDueDate] = useState('');
  const [files, setFiles] = useState([]);
  const [classList, setClassList] = useState([]); // List of classes the guru teaches

  useEffect(() => {
    const checkUserAndFetchClasses = async () => {
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
        setMessage('Akses ditolak: Anda tidak memiliki izin untuk menambahkan tugas.');
        await supabase.auth.signOut();
        router.push('/');
        return;
      }

      setUserData(profile);

      // Fetch classes the guru is associated with
      // For a 'guru' role, it's typically one class. For 'super_admin', they might see all.
      let classesData;
      if (profile.role === 'guru' && profile.classes?.id) {
        // If a regular guru, pre-select their class and make it read-only
        setSelectedClassId(profile.classes.id);
        classesData = [profile.classes];
      } else if (profile.role === 'super_admin') {
        // Super admin can choose any class
        const { data: allClasses, error: allClassesError } = await supabase
          .from('classes')
          .select('id, name');
        if (allClassesError) {
          setMessage('Error fetching classes: ' + allClassesError.message);
          setLoading(false);
          return;
        }
        classesData = allClasses;
      } else {
        setMessage('Anda belum ditugaskan ke kelas manapun atau peran Anda tidak didukung.');
        setLoading(false);
        return;
      }
      setClassList(classesData);
      setLoading(false);
    };

    checkUserAndFetchClasses();
  }, [router, supabase, initialClassId]);

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!title || !description || !subject || !selectedClassId || !dueDate) {
      setMessage('Semua kolom wajib diisi, termasuk mata pelajaran, kelas, dan tanggal tenggat.');
      setLoading(false);
      return;
    }

    if (!user) {
      setMessage('User tidak terautentikasi.');
      setLoading(false);
      return;
    }

    let fileUrl = null;
    let fileName = null;
    let fileType = null;

    try {
      // 1. Insert assignment into 'assignments' table
      const { data: assignment, error: assignmentError } = await supabase
        .from('assignments')
        .insert({
          title,
          description,
          subject,
          class_id: selectedClassId,
          due_date: dueDate,
          created_by: user.id,
        })
        .select()
        .single();

      if (assignmentError) {
        throw assignmentError;
      }

      // 2. Upload files to Supabase Storage and record in 'assignment_files'
      const uploadedFileDetails = [];
      for (const file of files) {
        const fileExtension = file.name.split('.').pop();
        const path = `assignment_files/${assignment.id}/${Date.now()}_${file.name}`; // Unique path

        // Using 'attach' bucket
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('attach') // Using 'attach' bucket
          .upload(path, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error('Error uploading file:', JSON.stringify(uploadError, null, 2)); // Better debugging
          setMessage((prev) => prev + ` Gagal mengunggah file ${file.name}: ${uploadError.message || 'Error tidak diketahui'}.`);
          continue; // Continue with other files
        }

        // Get public URL for the uploaded file
        // Using 'attach' bucket
        const { data: publicUrlData } = supabase.storage
          .from('attach') // Using 'attach' bucket
          .getPublicUrl(path);

        if (!publicUrlData || publicUrlData.error) {
            console.error('Error getting public URL:', publicUrlData.error);
            setMessage((prev) => prev + ` Gagal mendapatkan URL publik untuk ${file.name}.`);
            continue;
        }

        uploadedFileDetails.push({
          assignment_id: assignment.id,
          file_url: publicUrlData.publicUrl,
          file_name: file.name,
          file_type: file.type,
        });
      }

      if (uploadedFileDetails.length > 0) {
        const { error: fileInsertError } = await supabase
          .from('assignment_files')
          .insert(uploadedFileDetails);

        if (fileInsertError) {
          console.error('Error inserting file details into DB:', fileInsertError);
          setMessage((prev) => prev + ' Error menyimpan detail file ke database.');
        }
      }

      setMessage('Tugas berhasil ditambahkan!');
      setTitle('');
      setDescription('');
      setSubject('');
      // Keep selectedClassId if it's guru's assigned class, clear if super admin
      if (userData?.role === 'super_admin') setSelectedClassId('');
      setDueDate('');
      setFiles([]);

    } catch (error) {
      console.error('Failed to add assignment:', error.message);
      setMessage('Gagal menambahkan tugas: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-blue-600 text-lg">Memuat halaman tambah tugas...</div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-100">
        <div className="container mx-auto p-4 md:p-8 max-w-4xl font-sans">
      {/* Back button to Materi & Tugas Kelas, preserving classId */}
      <Link href={`/guru/materi-dan-tugas?classId=${selectedClassId}`} className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Kembali ke Materi & Tugas Kelas
      </Link>

      <h1 className="text-3xl font-bold mb-6 text-gray-800">Tambah Tugas Baru</h1>

      {message && (
        <p className={`mb-4 p-3 rounded ${message.includes('Gagal') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Judul Tugas
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Deskripsi Tugas
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="5"
            className="mt-1 block w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          ></textarea>
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
            Mata Pelajaran
          </label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-1">
            Untuk Kelas
          </label>
          <select
            id="class"
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
            disabled={userData?.role === 'guru' && userData?.classes?.id && selectedClassId === userData?.classes?.id} // Disable if guru and class is set
          >
            <option value="">Pilih Kelas</option>
            {classList.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
            Tanggal Tenggat
          </label>
          <input
            type="datetime-local"
            id="dueDate"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-1">
            Lampiran File (Opsional)
          </label>
          <input
            type="file"
            id="file-upload"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-500
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-full file:border-0
                       file:text-sm file:font-semibold
                       file:bg-blue-50 file:text-blue-700
                       hover:file:bg-blue-100"
            multiple // Allow multiple file selection
          />
          {files.length > 0 && (
            <p className="mt-2 text-sm text-gray-600">
              Files selected: {files.map(f => f.name).join(', ')}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={loading}
        >
          {loading ? 'Menyimpan Tugas...' : 'Tambah Tugas'}
        </button>
      </form>
    </div>
    </div>
  );
}

// Komponen utama halaman yang membungkus AddAssignmentContent dengan Suspense
export default function AddAssignmentPageWrapper() { // Ubah nama export default
  return (
    <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="text-blue-600 text-lg">Memuat halaman tambah tugas...</div>
        </div>
    }>
      <AddAssignmentContent /> {/* Render komponen inti di sini */}
    </Suspense>
  );
}
