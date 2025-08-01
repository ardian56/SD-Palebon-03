// app/guru/tugas/edit/[assignmentId]/page.jsx
"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabaseClient'; // Sesuaikan path

// Komponen utama untuk mengedit tugas
function EditTugasContent() {
  const router = useRouter();
  const supabase = createClient();
  const params = useParams();
  const assignmentId = params.assignmentId; // Mengambil ID tugas dari URL

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null); // Data profil guru
  const [assignment, setAssignment] = useState(null); // Data tugas yang akan diedit
  const [message, setMessage] = useState('');

  // State untuk form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMapelId, setSelectedMapelId] = useState(''); // Ganti subject dengan selectedMapelId
  const [mapelName, setMapelName] = useState(''); // State untuk menampilkan nama mapel
  const [selectedClassId, setSelectedClassId] = useState('');
  const [dueDate, setDueDate] = useState(''); // Ini masih string dari input datetime-local
  const [existingFiles, setExistingFiles] = useState([]); // File yang sudah ada
  const [newFiles, setNewFiles] = useState([]); // File baru yang diunggah
  const [classList, setClassList] = useState([]); // Daftar kelas yang tersedia

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
        .select('name, role, classes(id, name)')
        .eq('id', session.user.id)
        .single();

      if (profileError || (!['guru', 'super_admin'].includes(profile?.role))) {
        setMessage('Akses ditolak: Anda tidak memiliki izin untuk mengedit tugas.');
        await supabase.auth.signOut();
        router.push('/');
        return;
      }
      setUserData(profile);

      // Fetch classes for the dropdown
      let classesData;
      if (profile.role === 'guru' && profile.classes?.id) {
        classesData = [profile.classes]; // Guru hanya bisa mengedit tugas di kelasnya
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

      // Ambil detail tugas yang akan diedit
      if (assignmentId) {
        const { data: fetchedAssignment, error: assignmentError } = await supabase
          .from('assignments')
          .select('*, assignment_files(id, file_url, file_name, file_type)')
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

        // Validasi akses: hanya pembuat tugas atau super admin yang bisa mengedit
        if (profile.role === 'guru' && fetchedAssignment.created_by !== session.user.id) {
          setMessage('Akses ditolak: Anda tidak membuat tugas ini.');
          setLoading(false);
          return;
        }

        setAssignment(fetchedAssignment);
        setTitle(fetchedAssignment.title);
        setDescription(fetchedAssignment.description);
        setSelectedMapelId(fetchedAssignment.mapel_id); // Update untuk menggunakan mapel_id
        setSelectedClassId(fetchedAssignment.class_id);

        // Ambil nama mata pelajaran
        if (fetchedAssignment.mapel_id) {
          const { data: mapel, error: mapelError } = await supabase
            .from('mapel')
            .select('name')
            .eq('id', fetchedAssignment.mapel_id)
            .single();
          if (!mapelError) {
            setMapelName(mapel.name);
          }
        }

        // --- PERBAIKAN DI SINI: Format tanggal untuk input datetime-local agar sesuai zona waktu lokal ---
        const dbDueDate = fetchedAssignment.due_date ? new Date(fetchedAssignment.due_date) : null;
        const formattedDueDate = dbDueDate ? dbDueDate.toLocaleString('sv-SE', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false // Pastikan format 24 jam
        }).replace(' ', 'T') : ''; // Ganti spasi dengan 'T'
        setDueDate(formattedDueDate);
        // --- AKHIR PERBAIKAN ---

        setExistingFiles(fetchedAssignment.assignment_files || []);
      }

      setLoading(false);
    };

    fetchData();

    // Listener real-time untuk perubahan pada tugas ini
    const assignmentSubscription = supabase
      .channel(`assignment_edit_${assignmentId}_changes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'assignments', filter: `id=eq.${assignmentId}` },
        payload => {
          console.log('Assignment change received!', payload);
          if (payload.new) {
            setAssignment(payload.new);
            setTitle(payload.new.title);
            setDescription(payload.new.description);
            setSelectedMapelId(payload.new.mapel_id); // Update untuk menggunakan mapel_id
            setSelectedClassId(payload.new.class_id);
            // Update due date in real-time listeners as well
            const dbDueDate = payload.new.due_date ? new Date(payload.new.due_date) : null;
            const formattedDueDate = dbDueDate ? dbDueDate.toLocaleString('sv-SE', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }).replace(' ', 'T') : '';
            setDueDate(formattedDueDate);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'assignment_files', filter: `assignment_id=eq.${assignmentId}` },
        async payload => {
            console.log('Assignment files change received!', payload);
            // Refresh assignment files
            const { data: updatedAssignment, error: fetchError } = await supabase
              .from('assignments')
              .select('*, assignment_files(id, file_url, file_name, file_type)')
              .eq('id', assignmentId)
              .single();
            if (!fetchError) {
              setAssignment(updatedAssignment);
              setExistingFiles(updatedAssignment.assignment_files || []);
            }
        }
      )
      .subscribe();

    return () => {
      assignmentSubscription.unsubscribe();
    };

  }, [router, supabase, assignmentId, user?.id]);

  const handleNewFileChange = (e) => {
    setNewFiles([...e.target.files]);
  };

  const handleDeleteExistingFile = async (fileId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus file ini?')) {
      setLoading(true);
      setMessage('');
      try {
        const fileToDelete = existingFiles.find(f => f.id === fileId);
        if (fileToDelete && fileToDelete.file_url) {
            const filePath = fileToDelete.file_url.split('/storage/v1/object/public/attach/')[1];
            if (filePath) {
                const { error: storageError } = await supabase.storage
                    .from('attach')
                    .remove([filePath]);
                if (storageError) {
                    console.error('Error deleting file from storage:', storageError);
                }
            }
        }

        const { error } = await supabase
          .from('assignment_files')
          .delete()
          .eq('id', fileId);

        if (error) {
          throw error;
        }
        setMessage('File berhasil dihapus!');
        setExistingFiles(prev => prev.filter(f => f.id !== fileId));
      } catch (error) {
        console.error('Error deleting file:', error.message);
        setMessage('Gagal menghapus file: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!title || !description || !selectedMapelId || !selectedClassId || !dueDate) {
      setMessage('Semua kolom wajib diisi, termasuk mata pelajaran, kelas, dan tanggal tenggat.');
      setLoading(false);
      return;
    }

    if (!user || !assignment) {
      setMessage('Autentikasi gagal atau tugas tidak valid.');
      setLoading(false);
      return;
    }

    try {
      const { error: assignmentUpdateError } = await supabase
        .from('assignments')
        .update({
          title,
          description,
          mapel_id: selectedMapelId, // Update untuk menggunakan mapel_id
          class_id: selectedClassId,
          due_date: new Date(dueDate), // Fix: Convert string to Date object for saving
        })
        .eq('id', assignment.id)
        .eq('created_by', user.id);

      if (assignmentUpdateError) {
        throw assignmentUpdateError;
      }

      const uploadedFileDetails = [];
      for (const file of newFiles) {
        const fileExtension = file.name.split('.').pop();
        const path = `assignment_files/${assignment.id}/${Date.now()}_${file.name}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('attach')
          .upload(path, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error('Error uploading file:', JSON.stringify(uploadError, null, 2));
          setMessage((prev) => prev + ` Gagal mengunggah file baru ${file.name}: ${uploadError.message || 'Error tidak diketahui'}.`);
          continue;
        }

        const { data: publicUrlData } = supabase.storage
          .from('attach')
          .getPublicUrl(path);

        if (!publicUrlData || publicUrlData.error) {
            console.error('Error getting public URL:', publicUrlData.error);
            setMessage((prev) => prev + ` Gagal mendapatkan URL publik untuk file baru ${file.name}.`);
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
          console.error('Error inserting new file details into DB:', fileInsertError);
          setMessage((prev) => prev + ' Error menyimpan detail file baru ke database.');
        }
      }

      setMessage('Tugas berhasil diperbarui!');
      setNewFiles([]);
      const { data: updatedAssignment, error: fetchError } = await supabase
          .from('assignments')
          .select('*, assignment_files(id, file_url, file_name, file_type)')
          .eq('id', assignmentId)
          .single();
      if (!fetchError) {
          setAssignment(updatedAssignment);
          setExistingFiles(updatedAssignment.assignment_files || []);
      }

    } catch (error) {
      console.error('Gagal memperbarui tugas:', error.message);
      setMessage('Gagal memperbarui tugas: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-blue-600 text-lg">Memuat halaman edit tugas...</div>
      </div>
    );
  }

  if (message && !assignment) {
    return (
      <div className="container mx-auto p-4 md:p-8 max-w-4xl font-sans">
        <p className="mb-4 p-3 rounded bg-red-100 text-red-700">
          {message}
        </p>
        <Link href={`/guru/materi-dan-tugas/${selectedMapelId}?classId=${selectedClassId}`} className="inline-flex items-center text-blue-600 hover:text-blue-800 mt-4">
            &larr; Kembali ke Daftar Tugas
        </Link>
      </div>
    );
  }

  if (!assignment) {
      return null;
  }

  return (
    <div className="w-full bg-gray-100">
      <div className="container mx-auto p-4 md:p-8 max-w-4xl font-sans">
      <Link href={`/guru/materi-dan-tugas/${selectedMapelId}?classId=${selectedClassId}`} className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Kembali ke Daftar Tugas
      </Link>

      <h1 className="text-3xl font-bold mb-6 text-gray-800">Edit Tugas: "{assignment.title}"</h1>

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
            {classList.map((cls, index) => (
              <option key={cls.id || `class-${index}`} value={cls.id}>
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

        {/* Bagian File yang Sudah Ada */}
        {existingFiles.length > 0 && (
          <div className="border border-gray-200 rounded-md p-4">
            <h3 className="text-md font-semibold text-gray-700 mb-2">File Lampiran yang Sudah Ada:</h3>
            <ul className="space-y-2">
              {existingFiles.map((file, index) => (
                <li key={file.id || `file-${index}`} className="flex justify-between items-center bg-gray-50 p-2 rounded-md">
                  <a href={file.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                    {file.file_name} ({file.file_type})
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDeleteExistingFile(file.id)}
                    className="ml-4 text-red-600 hover:text-red-800 text-sm font-medium"
                    disabled={loading}
                  >
                    Hapus
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Bagian Unggah File Baru */}
        <div>
          <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-1">
            Unggah File Baru (Opsional, akan ditambahkan ke yang sudah ada)
          </label>
          <input
            type="file"
            id="file-upload"
            onChange={(e) => setNewFiles([...e.target.files])} // Tambahkan handleNewFileChange
            className="mt-1 block w-full text-sm text-gray-500
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-full file:border-0
                       file:text-sm file:font-semibold
                       file:bg-blue-50 file:text-blue-700
                       hover:file:bg-blue-100"
            multiple
          />
          {newFiles.length > 0 && (
            <p className="mt-2 text-sm text-gray-600">
              File baru terpilih: {newFiles.map(f => f.name).join(', ')}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={loading}
        >
          {loading ? 'Memperbarui Tugas...' : 'Simpan Perubahan'}
        </button>
      </form>
    </div>
    </div>
  );
}

export default function EditTugasPageWrapper() {
  return (
    <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="text-blue-600 text-lg">Memuat halaman edit tugas...</div>
        </div>
    }>
      <EditTugasContent />
    </Suspense>
  );
}
