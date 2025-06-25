'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabaseClient'; // Client-side Supabase client
import { Plus, X, Edit, Trash2, Trophy } from 'lucide-react'; // Menggunakan ikon Trophy untuk Ekstra

export default function AdminEkstraPage() {
  const [name, setName] = useState(''); // State untuk nama ekstrakurikuler
  const [description, setDescription] = useState(''); // State untuk deskripsi ekstrakurikuler
  const [data, setData] = useState([]); // Data daftar ekstrakurikuler
  const [showForm, setShowForm] = useState(false); // Kontrol tampilan form
  const [isEditing, setIsEditing] = useState(false); // Mode edit atau tambah
  const [editId, setEditId] = useState(null); // ID item yang sedang diedit

  const supabase = createClient(); // Inisialisasi client Supabase

  useEffect(() => {
    fetchEkstra(); // Panggil fungsi fetch saat komponen dimuat
  }, []);

  async function fetchEkstra() {
    // Ambil data dari tabel 'extracurriculars'
    const { data, error } = await supabase
      .from('extracurriculars')
      .select('*')
      .order('name', { ascending: true }); // Urutkan berdasarkan nama

    if (error) {
      console.error('Error fetching extracurriculars data:', error.message);
      // Anda bisa menampilkan pesan error di UI jika perlu
    } else {
      setData(data || []);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi input
    if (!name || !description) {
      alert('Nama dan Deskripsi ekstrakurikuler wajib diisi!');
      return;
    }

    try {
      if (isEditing) {
        // Logika Update data ekstrakurikuler
        const { error } = await supabase
          .from('extracurriculars')
          .update({ name, description }) // Update kolom nama dan deskripsi
          .eq('id', editId);

        if (error) {
          throw new Error('Gagal mengedit data ekstrakurikuler: ' + error.message);
        }
        alert('Data ekstrakurikuler berhasil diperbarui!');
      } else {
        // Logika Tambah data ekstrakurikuler baru
        const { error } = await supabase
          .from('extracurriculars')
          .insert({ name, description }); // Insert kolom nama dan deskripsi

        if (error) {
          throw new Error('Gagal menyimpan data ekstrakurikuler: ' + error.message);
        }
        alert('Ekstrakurikuler berhasil ditambahkan!');
      }

      resetForm(); // Reset form setelah submit
      fetchEkstra(); // Muat ulang data
    } catch (err) {
      console.error('Error handling form submission:', err.message);
      alert('Terjadi kesalahan: ' + err.message);
    }
  };

  function resetForm() {
    setName('');
    setDescription('');
    setEditId(null);
    setIsEditing(false);
    setShowForm(false);
  }

  async function deleteData(id) {
    const confirmDelete = window.confirm('Yakin ingin menghapus data ekstrakurikuler ini?');
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('extracurriculars')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error('Gagal menghapus data ekstrakurikuler: ' + error.message);
      }
      alert('Data ekstrakurikuler berhasil dihapus!');
      fetchEkstra(); // Muat ulang data setelah penghapusan
    } catch (err) {
      console.error('An unexpected error occurred during deletion:', err.message);
      alert('Terjadi kesalahan saat menghapus data: ' + err.message);
    }
  }

  function startEdit(item) {
    setIsEditing(true);
    setEditId(item.id);
    setName(item.name);
    setDescription(item.description);
    setShowForm(true);
  }

  return (
    <div className="p-4 sm:p-6 text-white bg-[#111] min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <Trophy size={24} className="text-orange-400" /> {/* Ikon Trophy */}
        <h2 className="text-3xl font-semibold text-white tracking-wide"> Admin Ekstrakurikuler</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (isEditing) resetForm();
          }}
          className={`p-2 rounded-full ${showForm ? 'bg-red-600' : 'bg-orange-500'} hover:opacity-80 text-white`}
          title={showForm ? 'Tutup Form' : 'Tambah Ekstrakurikuler'}
        >
          {showForm ? <X size={20} /> : <Plus size={20} />}
        </button>
      </div>

      {showForm && (
        <div className="bg-[#1a1a1a] border border-gray-700 p-4 rounded-xl mb-8 shadow-sm">
          <h3 className="text-lg font-medium text-orange-400 mb-3">
            {isEditing ? 'Edit Ekstrakurikuler' : 'Form Tambah Ekstrakurikuler'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              className="bg-[#222] border border-gray-600 text-white px-3 py-2 rounded w-full focus:outline-none"
              placeholder="Nama Ekstrakurikuler (contoh: Sepak Bola)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <textarea
              className="bg-[#222] border border-gray-600 text-white px-3 py-2 rounded w-full focus:outline-none h-24 resize-y"
              placeholder="Deskripsi Ekstrakurikuler (contoh: Latihan teknik dasar, strategi, dan pertandingan persahabatan)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
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

      {/* Tidak ada filter kelas atau lainnya, jadi langsung tampilkan data */}
      <div className="overflow-x-auto rounded-lg shadow-sm">
        <table className="min-w-full text-sm bg-[#1a1a1a] border border-gray-700">
          <thead className="bg-[#222] text-orange-400">
            <tr>
              <th className="px-4 py-3 border border-gray-700 text-left">Nama Ekstrakurikuler</th><th className="px-4 py-3 border border-gray-700 text-left">Deskripsi</th><th className="px-4 py-3 border border-gray-700 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center text-gray-400 py-4">Belum ada data ekstrakurikuler.</td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={item.id} className={index % 2 === 0 ? 'bg-[#1a1a1a]' : 'bg-[#181818]'}>
                  <td className="px-4 py-3 border border-gray-700 align-top">{item.name}</td><td className="px-4 py-3 border border-gray-700 align-top">{item.description}</td><td className="px-4 py-3 border border-gray-700 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => startEdit(item)} className="text-yellow-400 hover:text-yellow-300" title="Edit">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => deleteData(item.id)} className="text-red-500 hover:text-red-400" title="Hapus">
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