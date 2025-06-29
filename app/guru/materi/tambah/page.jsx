// app/guru/materi/tambah/page.jsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; // Import useSearchParams
import Link from 'next/link';
import { createClient } from '@/lib/supabaseClient'; // Sesuaikan path

export default function AddMateriPage() {
  const router = useRouter();
  const searchParams = useSearchParams(); // Mengambil search params dari URL
  const supabase = createClient();

  const initialClassId = searchParams.get('classId') || ''; // Ambil classId dari URL

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null); // Data profil guru
  const [message, setMessage] = useState('');

  // State untuk form materi
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [selectedClassId, setSelectedClassId] = useState(initialClassId); // Set initial classId
  const [materialFile, setMaterialFile] = useState(null); // Hanya satu file untuk materi
  const [classList, setClassList] = useState([]); // Daftar kelas yang tersedia

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
        setMessage('Akses ditolak: Anda tidak memiliki izin untuk menambahkan materi.');
        await supabase.auth.signOut();
        router.push('/');
        return;
      }

      setUserData(profile);

      // Ambil daftar kelas untuk dropdown
      let classesData;
      if (profile.role === 'guru' && profile.classes?.id) {
        classesData = [profile.classes]; // Guru hanya bisa menambah materi di kelasnya
        setSelectedClassId(profile.classes.id); // Set selectedClassId jika guru
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
      setLoading(false);
    };

    checkUserAndFetchClasses();
  }, [router, supabase, initialClassId]); // Tambahkan initialClassId ke dependensi

  const handleFileChange = (e) => {
    setMaterialFile(e.target.files[0]); // Hanya satu file untuk materi
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!title || !description || !subject || !selectedClassId) {
      setMessage('Judul, deskripsi, mata pelajaran, dan kelas wajib diisi.');
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
      if (materialFile) {
        // Unggah file materi ke Supabase Storage
        const fileExtension = materialFile.name.split('.').pop();
        const path = `class_materials/${Date.now()}_${materialFile.name}`; // Path unik

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('attach') // Menggunakan bucket 'attach'
          .upload(path, materialFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error('Error uploading file:', JSON.stringify(uploadError, null, 2));
          throw new Error(`Gagal mengunggah file: ${uploadError.message || 'Error tidak diketahui'}`);
        }

        const { data: publicUrlData } = supabase.storage
          .from('attach') // Menggunakan bucket 'attach'
          .getPublicUrl(path);

        if (!publicUrlData || publicUrlData.error) {
            console.error('Error getting public URL:', publicUrlData.error);
            throw new Error(`Gagal mendapatkan URL publik untuk file: ${publicUrlData.error?.message || 'Error tidak diketahui'}`);
        }

        fileUrl = publicUrlData.publicUrl;
        fileName = materialFile.name;
        fileType = materialFile.type;
      }

      // Masukkan materi ke tabel 'class_materials'
      const { data: material, error: materialError } = await supabase
        .from('class_materials')
        .insert({
          title,
          description,
          subject,
          class_id: selectedClassId,
          file_url: fileUrl,
          file_name: fileName,
          file_type: fileType,
          created_by: user.id,
        })
        .select()
        .single();

      if (materialError) {
        throw materialError;
      }

      setMessage('Materi berhasil ditambahkan!');
      setTitle('');
      setDescription('');
      setSubject('');
      setMaterialFile(null); // Hapus file dari input
      // selectedClassId dipertahankan jika guru biasa, direset jika super admin
      if (userData?.role === 'super_admin') setSelectedClassId('');

    } catch (error) {
      console.error('Gagal menambahkan materi:', error.message);
      setMessage('Gagal menambahkan materi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-blue-600 text-lg">Memuat halaman tambah materi...</div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-100">
      <div className="container mx-auto p-4 md:p-8 max-w-4xl font-sans">
      <Link href={`/guru/materi-dan-tugas?classId=${selectedClassId}`} className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Kembali ke Materi & Tugas Kelas
      </Link>

      <h1 className="text-3xl font-bold mb-6 text-gray-800">Tambah Materi Baru</h1>

      {message && (
        <p className={`mb-4 p-3 rounded ${message.includes('Gagal') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Judul Materi
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Deskripsi Materi (Opsional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="5"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
          <label htmlFor="material-file" className="block text-sm font-medium text-gray-700 mb-1">
            Lampiran File Materi (Opsional)
          </label>
          <input
            type="file"
            id="material-file"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-500
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-full file:border-0
                       file:text-sm file:font-semibold
                       file:bg-blue-50 file:text-blue-700
                       hover:file:bg-blue-100"
          />
          {materialFile && (
            <p className="mt-2 text-sm text-gray-600">File terpilih: {materialFile.name}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={loading}
        >
          {loading ? 'Menyimpan Materi...' : 'Tambah Materi'}
        </button>
      </form>
    </div>
    </div>
  );
}
