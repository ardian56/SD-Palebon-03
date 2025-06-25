// components/AdminGuruPage.js (atau pages/admin/guru.js)
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabaseClient'; // Client-side Supabase client
import { Plus, X, Edit, Trash2, Users } from 'lucide-react';
import Image from 'next/image';

export default function AdminGuruPage() {
  const [nama, setNama] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [fotoFile, setFotoFile] = useState(null);
  const [data, setData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [classesOptions, setClassesOptions] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');

  const supabase = createClient(); // Client-side Supabase client

  useEffect(() => {
    fetchGuruAndClasses();
  }, []);

  async function fetchGuruAndClasses() {
    try {
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('id, name')
        .order('name', { ascending: true });
      if (classesError) throw classesError;
      setClassesOptions(classesData || []);

      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, name, email, photo_url, role, classes(name), class_id')
        .eq('role', 'guru')
        .order('name', { ascending: true });
      if (usersError) throw usersError;
      setData(usersData || []);
    } catch (err) {
      console.error("Error fetching data:", err.message);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEditing && (!nama || !emailInput || !passwordInput || !fotoFile)) {
        alert('Nama, Email, Password, dan Foto harus diisi untuk user baru!');
        return;
    }
    if (isEditing && !nama) {
        alert('Nama harus diisi!');
        return;
    }

    let photoUrl = null;
    if (fotoFile) {
      const fileExt = fotoFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `user/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, fotoFile, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        console.error('Upload foto gagal:', uploadError.message);
        return alert('Upload foto gagal! ' + uploadError.message);
      }
      photoUrl = supabase.storage.from('images').getPublicUrl(filePath).data.publicUrl;
    }

    const classToStore = selectedClassId === '' ? null : selectedClassId;

    try {
      if (isEditing) {
        // Logika Edit User: Update data di public.users
        const updateData = {
          name: nama,
          class_id: classToStore,
          ...(photoUrl && { photo_url: photoUrl }),
        };

        const { error } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', editId)
          .eq('role', 'guru');

        if (error) throw new Error('Gagal mengedit data guru: ' + error.message);
        alert('Data guru berhasil diperbarui!');

      } else {
        // Logika Tambah User Baru: Panggil API Route
        const response = await fetch('/api/admin/create-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Opsi: Jika Anda memerlukan otorisasi admin di API Route, kirim token di sini
            // 'Authorization': `Bearer ${supabase.auth.getSession()?.data.session?.access_token}`
          },
          body: JSON.stringify({
            name: nama,
            email: emailInput,
            password: passwordInput,
            role: 'guru',
            class_id: classToStore,
            photo_url: photoUrl,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Gagal menambahkan user baru.');
        }

        alert('Guru berhasil ditambahkan!');
      }

      resetForm();
      fetchGuruAndClasses();

    } catch (err) {
      console.error('Error handling form submission:', err.message);
      alert('Terjadi kesalahan: ' + err.message);
    }
  };

  function resetForm() {
    setNama('');
    setEmailInput('');
    setPasswordInput('');
    setFotoFile(null);
    setEditId(null);
    setIsEditing(false);
    setShowForm(false);
    setSelectedClassId('');
  }

  async function deleteGuru(id, photoUrl) {
    const confirmDelete = window.confirm('Yakin ingin menghapus data ini? Ini juga akan menghapus foto dari storage.');
    if (!confirmDelete) return;

    try {
      // Hapus foto dari storage
      if (photoUrl) {
        const pathSegments = photoUrl.split('/');
        const fileNameWithFolder = pathSegments.slice(pathSegments.indexOf('user_photos')).join('/');

        const { error: storageError } = await supabase.storage
          .from('images')
          .remove([fileNameWithFolder]);

        if (storageError && storageError.statusCode !== '404') {
          console.error('Error deleting photo from storage:', storageError.message);
        }
      }

      // Hapus user dari Auth Supabase.
      // Karena `public.users` memiliki ON DELETE CASCADE ke `auth.users`,
      // baris di `public.users` akan otomatis terhapus.
      const { error: authDeleteError } = await supabase.auth.admin.deleteUser(id);
      if (authDeleteError) {
          throw new Error(`Gagal menghapus user dari Auth: ${authDeleteError.message}`);
      }

      alert('Data guru berhasil dihapus!');
      fetchGuruAndClasses();
    } catch (err) {
      console.error('An unexpected error occurred during deletion:', err.message);
      alert('Terjadi kesalahan saat menghapus data: ' + err.message);
    }
  }

  function startEdit(item) {
    setIsEditing(true);
    setEditId(item.id);
    setNama(item.name);
    setEmailInput(item.email); // Tampilkan email, tapi inputnya disabled saat edit
    setPasswordInput(''); // Kosongkan password saat edit
    setSelectedClassId(item.class_id || '');
    setFotoFile(null);
    setShowForm(true);
  }

  return (
    <div className="p-4 text-white">
      <div className="flex justify-between items-center mb-4">
        <Users size={24} className="text-orange-400" />
        <h2 className="text-3xl font-semibold text-white tracking-wide">
          Admin Guru
        </h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (isEditing) resetForm();
          }}
          className={`p-2 rounded-full text-white ${showForm ? 'bg-red-600' : 'bg-orange-600'} hover:opacity-80`}
        >
          {showForm ? <X size={20} /> : <Plus size={20} />}
        </button>
      </div>

      {showForm && (
        <div className="bg-[#1e1e1e] p-4 rounded-lg border border-gray-700 mb-6">
          <h3 className="text-lg font-medium text-orange-400 mb-3">
            {isEditing ? 'Edit Guru' : 'Form Tambah Guru'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                className="w-full p-2 rounded bg-[#2b2b2b] text-white border border-gray-600"
                placeholder="Nama Guru"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
              />
            </div>
            {!isEditing && (
                <>
                    <div>
                        <input
                            className="w-full p-2 rounded bg-[#2b2b2b] text-white border border-gray-600"
                            placeholder="Email"
                            type="email"
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                        />
                    </div>
                    <div>
                        <input
                            className="w-full p-2 rounded bg-[#2b2b2b] text-white border border-gray-600"
                            placeholder="Password"
                            type="password"
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                        />
                    </div>
                </>
            )}
            <div>
              <label htmlFor="class-select" className="block text-sm text-gray-400 mb-1">Kelas yang Diampu (Opsional):</label>
              <select
                id="class-select"
                className="w-full p-2 rounded bg-[#2b2b2b] text-white border border-gray-600"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
              >
                <option value="">-- Pilih Kelas --</option>
                {classesOptions.map((cls) => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Foto Profil:</label>
              <input
                type="file"
                className="text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-500 file:text-white hover:file:bg-orange-600"
                onChange={(e) => setFotoFile(e.target.files[0])}
              />
              {isEditing && !fotoFile && data.find(item => item.id === editId)?.photo_url && (
                <p className="text-xs text-gray-400 mt-1">
                    Foto saat ini akan tetap digunakan jika tidak ada file baru yang dipilih.
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" className="bg-orange-500 px-4 py-2 rounded text-white hover:bg-orange-600">
                {isEditing ? 'Update' : 'Simpan'}
              </button>
              {isEditing && (
                <button type="button" onClick={resetForm} className="text-sm underline text-gray-400 hover:text-white">
                  Batal Edit
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border border-gray-700 rounded-lg overflow-hidden">
          <thead className="bg-[#1a1a1a] text-orange-400">
            <tr>
              <th className="p-3 border-b border-gray-700 text-left">Nama</th><th className="p-3 border-b border-gray-700 text-left">Email</th><th className="p-3 border-b border-gray-700 text-left">Kelas Diampu</th><th className="p-3 border-b border-gray-700 text-center">Foto</th><th className="p-3 border-b border-gray-700 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-400">Belum ada data guru.</td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={item.id} className={index % 2 === 0 ? 'bg-[#1e1e1e]' : 'bg-[#252525]'}>
                  <td className="p-3 border-b border-gray-700">{item.name}</td><td className="p-3 border-b border-gray-700">{item.email}</td><td className="p-3 border-b border-gray-700">
                    {item.classes?.name ? `Guru Kelas ${item.classes.name}` : 'Guru'}
                  </td><td className="p-3 border-b border-gray-700 text-center">
                    {item.photo_url ? (
                      <Image
                        src={item.photo_url}
                        alt={`foto ${item.name}`}
                        width={64}
                        height={64}
                        className="object-cover rounded mx-auto"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-600 rounded flex items-center justify-center mx-auto text-gray-400 text-xl">
                          {item.name ? item.name[0].toUpperCase() : 'G'}
                      </div>
                    )}
                  </td><td className="p-3 border-b border-gray-700 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => startEdit(item)} title="Edit" className="text-yellow-400 hover:text-yellow-300">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => deleteGuru(item.id, item.photo_url)} title="Hapus" className="text-red-500 hover:text-red-400">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}