'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Plus, X, Edit, Trash2, Users } from 'lucide-react';
import Image from 'next/image';

export default function AdminSiswaPage() {
  const [nama, setNama] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [fotoFile, setFotoFile] = useState(null);
  const [data, setData] = useState([]);
  const [filterClassId, setFilterClassId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [classesOptions, setClassesOptions] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [extracurricularFinalized, setExtracurricularFinalized] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchSiswaAndClasses();
  }, []);

  async function fetchSiswaAndClasses() {
    try {
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('id, name')
        .order('name', { ascending: true });

      if (classesError) {
        throw classesError;
      }
      setClassesOptions(classesData || []);

      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select(`
          id, name, email, role, photo_url, extracurricular_finalized, classes(id, name), class_id,
          student_extracurriculars(
            extracurricular_id,
            extracurriculars(name)
          )
        `)
        .eq('role', 'siswa')
        .order('name', { ascending: true });

      if (usersError) {
        throw usersError;
      }
      setData(usersData || []);

    } catch (err) {
      console.error('Error fetching student data:', err.message);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEditing) {
      if (!nama || !emailInput || !passwordInput) {
        alert('Nama, Email, dan Password harus diisi untuk user baru!');
        return;
      }
    } else {
      if (!nama) {
        alert('Nama harus diisi!');
        return;
      }
    }

    let photoUrl = null;
    if (fotoFile) {
      const fileExt = fotoFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `user/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, fotoFile, {
            cacheControl: '3600',
            upsert: false
        });

      if (uploadError) {
        console.error('Upload foto gagal:', uploadError.message);
        return alert('Upload foto gagal! ' + uploadError.message);
      }
      photoUrl = supabase.storage.from('images').getPublicUrl(filePath).data.publicUrl;
    }

    const classToStore = selectedClassId === '' ? null : selectedClassId;

    try {
      if (isEditing) {
        const updateData = {
          name: nama,
          class_id: classToStore,
          extracurricular_finalized: extracurricularFinalized,
          ...(photoUrl && { photo_url: photoUrl }),
        };

        const { error } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', editId)
          .eq('role', 'siswa');

        if (error) {
          throw new Error('Gagal mengedit data siswa: ' + error.message);
        }
        alert('Data siswa berhasil diperbarui!');

      } else {
        const response = await fetch('/api/admin/create-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: nama,
            email: emailInput,
            password: passwordInput,
            role: 'siswa',
            class_id: classToStore,
            photo_url: photoUrl,
            extracurricular_finalized: false, // Otomatis false untuk siswa baru
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Gagal menambahkan user baru.');
        }

        alert('Siswa berhasil ditambahkan!');
      }

      resetForm();
      fetchSiswaAndClasses();

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
    setSelectedClassId('');
    setExtracurricularFinalized(false);
    setEditId(null);
    setIsEditing(false);
    setShowForm(false);
  }

  async function deleteData(id, photoUrl) {
    const confirmDelete = window.confirm('Yakin ingin menghapus data siswa ini? Ini juga akan menghapus foto dari storage.');
    if (!confirmDelete) return;

    try {
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

      const { error: authDeleteError } = await supabase.auth.admin.deleteUser(id);
      if (authDeleteError) {
          throw new Error(`Gagal menghapus user dari Auth: ${authDeleteError.message}`);
      }

      alert('Data siswa berhasil dihapus!');
      fetchSiswaAndClasses();
    } catch (err) {
      console.error('An unexpected error occurred during deletion:', err.message);
      alert('Terjadi kesalahan saat menghapus data: ' + err.message);
    }
  }

  function startEdit(item) {
    setIsEditing(true);
    setEditId(item.id);
    setNama(item.name);
    setEmailInput(item.email);
    setSelectedClassId(item.class_id || '');
    setExtracurricularFinalized(item.extracurricular_finalized || false);
    setFotoFile(null);
    setPasswordInput('');
    setShowForm(true);
  }

  const filteredData = filterClassId
    ? data.filter((item) => item.class_id === filterClassId)
    : data;

  return (
    <div className="p-4 sm:p-6 text-white bg-[#111] min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <Users size={24} className="text-orange-400" />
        <h2 className="text-3xl font-semibold text-white tracking-wide"> Admin Siswa</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (isEditing) resetForm();
          }}
          className={`p-2 rounded-full ${showForm ? 'bg-red-600' : 'bg-orange-500'} hover:opacity-80 text-white`}
          title={showForm ? 'Tutup Form' : 'Tambah Siswa'}
        >
          {showForm ? <X size={20} /> : <Plus size={20} />}
        </button>
      </div>

      {showForm && (
        <div className="bg-[#1a1a1a] border border-gray-700 p-4 rounded-xl mb-8 shadow-sm">
          <h3 className="text-lg font-medium text-orange-400 mb-3">
            {isEditing ? 'Edit Siswa' : 'Form Tambah Siswa'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              className="bg-[#222] border border-gray-600 text-white px-3 py-2 rounded w-full focus:outline-none"
              placeholder="Nama Lengkap Siswa"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
            />
            {!isEditing && (
                <>
                    <input
                        className="bg-[#222] border border-gray-600 text-white px-3 py-2 rounded w-full focus:outline-none"
                        placeholder="Email Siswa"
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                    />
                    <input
                        className="bg-[#222] border border-gray-600 text-white px-3 py-2 rounded w-full focus:outline-none"
                        placeholder="Password Siswa"
                        type="password"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                    />
                </>
            )}
            <select
              className="bg-[#222] border border-gray-600 text-white px-3 py-2 rounded w-full"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
            >
              <option value="">Pilih Kelas (Opsional)</option>
              {classesOptions.map((cls) => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
            {isEditing && (
              <div>
                <label className="block text-sm text-gray-400 mb-2">Status Ekstrakurikuler:</label>
                <select
                  className="bg-[#222] border border-gray-600 text-white px-3 py-2 rounded w-full"
                  value={extracurricularFinalized}
                  onChange={(e) => setExtracurricularFinalized(e.target.value === 'true')}
                >
                  <option value="false">Belum Difinalisasi</option>
                  <option value="true">Sudah Difinalisasi</option>
                </select>
              </div>
            )}
            <div>
                <label className="block text-sm text-gray-400 mb-1">Foto Profil (Opsional):</label>
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
              <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded">
                {isEditing ? 'Update' : 'Simpan'}
              </button>
              {isEditing && (
                <button onClick={resetForm} type="button" className="text-sm text-gray-400 underline">
                  Batal Edit
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="mb-6">
        <label className="block mb-1 font-medium text-white">Filter Kelas:</label>
        <select
          className="bg-[#222] border border-gray-600 px-3 py-2 rounded w-full max-w-xs text-white"
          value={filterClassId}
          onChange={(e) => setFilterClassId(e.target.value)}
        >
          <option value="">Semua Kelas</option>
          {classesOptions.map((cls) => (
            <option key={cls.id} value={cls.id}>{cls.name}</option>
          ))}
        </select>
      </div>

      {/* Tampilan Tabel untuk Siswa */}
      <div className="overflow-x-auto rounded-lg shadow-sm">
        <table className="min-w-full text-sm bg-[#1a1a1a] border border-gray-700">
          <thead className="bg-[#222] text-orange-400">
            <tr>
              <th className="px-4 py-3 border border-gray-700 text-left">Nama</th>
              <th className="px-4 py-3 border border-gray-700 text-left">Email</th>
              <th className="px-4 py-3 border border-gray-700 text-left">Kelas</th>
              <th className="px-4 py-3 border border-gray-700 text-center">Status Ekstra</th>
              <th className="px-4 py-3 border border-gray-700 text-left">Ekstrakurikuler</th>
              <th className="px-4 py-3 border border-gray-700 text-center">Foto</th>
              <th className="px-4 py-3 border border-gray-700 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center text-gray-400 py-4">Belum ada data siswa.</td>
              </tr>
            ) : (
              filteredData.map((item, index) => (
                <tr key={item.id} className={index % 2 === 0 ? 'bg-[#1a1a1a]' : 'bg-[#181818]'}>
                  <td className="px-4 py-3 border border-gray-700 align-top">{item.name}</td>
                  <td className="px-4 py-3 border border-gray-700 align-top">{item.email}</td>
                  <td className="px-4 py-3 border border-gray-700 align-top">{item.classes?.name || 'Belum Ada Kelas'}</td>
                  <td className="px-4 py-3 border border-gray-700 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      item.extracurricular_finalized 
                        ? 'bg-green-600 text-green-100' 
                        : 'bg-orange-600 text-orange-100'
                    }`}>
                      {item.extracurricular_finalized ? 'Sudah Difinalisasi' : 'Belum Difinalisasi'}
                    </span>
                  </td>
                  <td className="px-4 py-3 border border-gray-700 align-top">
                    {item.extracurricular_finalized && item.student_extracurriculars && item.student_extracurriculars.length > 0 ? (
                      <div className="space-y-1">
                        {item.student_extracurriculars.map((se, idx) => (
                          <span key={idx} className="inline-block bg-blue-600 text-blue-100 px-2 py-1 rounded text-xs mr-1 mb-1">
                            {se.extracurriculars?.name || 'Tidak diketahui'}
                          </span>
                        ))}
                      </div>
                    ) : item.extracurricular_finalized ? (
                      <span className="text-gray-400 text-xs italic">Tidak ada ekstrakurikuler</span>
                    ) : (
                      <span className="text-gray-400 text-xs italic">Belum finalisasi</span>
                    )}
                  </td>
                  <td className="px-4 py-3 border border-gray-700 text-center">
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
                          {item.name ? item.name[0].toUpperCase() : 'S'}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 border border-gray-700 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => startEdit(item)} className="text-yellow-400 hover:text-yellow-300" title="Edit">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => deleteData(item.id, item.photo_url)} className="text-red-500 hover:text-red-400" title="Hapus">
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