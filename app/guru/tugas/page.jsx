// app/guru/tugas/tambah/page.jsx
"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabaseClient'; // Sesuaikan path

function AddAssignmentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const initialClassId = searchParams.get('classId') || '';
  const initialMapelId = searchParams.get('mapelId') || ''; // Ambil mapelId dari URL

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMapelId, setSelectedMapelId] = useState(initialMapelId); // State untuk mapel_id
  const [selectedClassId, setSelectedClassId] = useState(initialClassId);
  const [dueDate, setDueDate] = useState('');
  const [files, setFiles] = useState([]);
  const [classList, setClassList] = useState([]);
  const [mapelName, setMapelName] = useState(''); // State untuk menampilkan nama mapel

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

      // Ambil daftar kelas
      let classesData;
      if (profile.role === 'guru' && profile.classes?.id) {
        setSelectedClassId(profile.classes.id);
        classesData = [profile.classes];
      } else if (profile.role === 'super_admin') {
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

      // Ambil nama mata pelajaran jika mapelId ada di URL
      if (initialMapelId) {
        const { data: mapel, error: mapelError } = await supabase
          .from('mapel')
          .select('name')
          .eq('id', initialMapelId)
          .single();
        if (mapelError) {
          setMessage('Error fetching mapel name: ' + mapelError.message);
          setLoading(false);
          return;
        }
        setMapelName(mapel.name);
      } else {
        setMessage('ID Mata Pelajaran tidak ditemukan di URL.');
        setLoading(false);
        return;
      }

      setLoading(false);
    };

    checkUserAndFetchData();
  }, [router, supabase, initialClassId, initialMapelId]);

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Pastikan mapelId sudah terisi (dari URL)
    if (!title || !description || !selectedMapelId || !selectedClassId || !dueDate) {
      setMessage('Semua kolom wajib diisi, termasuk judul, deskripsi, kelas, dan tanggal tenggat.');
      setLoading(false);
      return;
    }

    if (!user) {
      setMessage('User tidak terautentikasi.');
      setLoading(false);
      return;
    }

    try {
      const { data: assignment, error: assignmentError } = await supabase
        .from('assignments')
        .insert({
          title,
          description,
          mapel_id: selectedMapelId, // Menggunakan mapel_id dari state
          class_id: selectedClassId,
          due_date: new Date(dueDate),
          created_by: user.id,
        })
        .select()
        .single();

      if (assignmentError) {
        throw assignmentError;
      }

      const uploadedFileDetails = [];
      for (const file of files) {
        const path = `assignment_files/${assignment.id}/${Date.now()}_${file.name}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('attach')
          .upload(path, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error('Error uploading file:', JSON.stringify(uploadError, null, 2));
          setMessage((prev) => prev + ` Gagal mengunggah file ${file.name}: ${uploadError.message || 'Error tidak diketahui'}.`);
          continue;
        }

        const { data: publicUrlData } = supabase.storage
          .from('attach')
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
      // selectedMapelId dan selectedClassId tidak direset karena sudah dari URL atau profil guru
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
    <div className="w-full bg-gray-100 min-h-screen">
        <div className="container mx-auto p-4 md:p-8 max-w-4xl font-sans">
      {/* Back button to Materi & Tugas Kelas, preserving classId and mapelId */}
      <Link href={`/guru/materi-dan-tugas/${selectedMapelId}?classId=${selectedClassId}`} className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Kembali ke Daftar Tugas
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

        {/* Bagian Mata Pelajaran (Sekarang hanya menampilkan teks) */}
        <div>
          <label htmlFor="mapel" className="block text-sm font-medium text-gray-700 mb-1">
            Mata Pelajaran
          </label>
          <input
            type="text"
            id="mapel"
            value={mapelName} // Menampilkan nama mapel
            className="mt-1 block w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed sm:text-sm"
            readOnly // Membuat input hanya bisa dibaca
            disabled // Menonaktifkan input
          />
          {/* Hidden input untuk memastikan mapel_id tetap terkirim */}
          <input type="hidden" name="mapel_id" value={selectedMapelId} />
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
            disabled={userData?.role === 'guru' && userData?.classes?.id && selectedClassId === userData?.classes?.id}
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
            multiple
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

export default function AddAssignmentPageWrapper() {
  return (
    <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="text-blue-600 text-lg">Memuat halaman tambah tugas...</div>
        </div>
    }>
      <AddAssignmentContent />
    </Suspense>
  );
}
