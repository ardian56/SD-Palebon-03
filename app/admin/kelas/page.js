'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, X, Edit, Trash2, BookOpen } from 'lucide-react';

export default function KelasPage() {
  const [nama, setNama] = useState('');
  const [kelas, setKelas] = useState('');
  const [gender, setGender] = useState('');
  const [data, setData] = useState([]);
  const [filterKelas, setFilterKelas] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data } = await supabase.from('kelas').select('*').order('created_at', { ascending: false });
    setData(data);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nama || !kelas || !gender) return alert('Semua field wajib diisi!');

    if (isEditing) {
      await supabase.from('kelas').update({ nama, kelas, gender }).eq('id', editId);
      alert('Data berhasil diperbarui!');
    } else {
      await supabase.from('kelas').insert({ nama, kelas, gender });
      alert('Data berhasil ditambahkan!');
    }

    resetForm();
    fetchData();
  };

  function resetForm() {
    setNama('');
    setKelas('');
    setGender('');
    setEditId(null);
    setIsEditing(false);
    setShowForm(false);
  }

  async function deleteData(id) {
    const confirmDelete = window.confirm('Yakin ingin menghapus data ini?');
    if (!confirmDelete) return;
    await supabase.from('kelas').delete().eq('id', id);
    fetchData();
  }

  function startEdit(item) {
    setIsEditing(true);
    setEditId(item.id);
    setNama(item.nama);
    setKelas(item.kelas);
    setGender(item.gender);
    setShowForm(true);
  }

  const filteredData = filterKelas
    ? data.filter((item) => item.kelas.toLowerCase() === filterKelas.toLowerCase())
    : data;

  const kelasOptions = [...new Set(data.map((item) => item.kelas))];

  return (
    <div className="p-4 sm:p-6 text-white bg-[#111] min-h-screen">
      <div className="flex items-center justify-between mb-6">
          <BookOpen size={24} className="text-orange-400" />
          <h2 className="text-3xl font-semibold text-white tracking-wide"> Siswa</h2>
       
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (isEditing) resetForm();
          }}
          className={`p-2 rounded-full ${showForm ? 'bg-red-600' : 'bg-orange-500'} hover:opacity-80 text-white`}
          title={showForm ? 'Tutup Form' : 'Tambah Kelas'}
        >
          {showForm ? <X size={20} /> : <Plus size={20} />}
        </button>
      </div>

      {showForm && (
        <div className="bg-[#1a1a1a] border border-gray-700 p-4 rounded-xl mb-8 shadow-sm">
          <h3 className="text-lg font-medium text-orange-400 mb-3">
            {isEditing ? 'Edit Kelas' : 'Form Tambah Kelas'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              className="bg-[#222] border border-gray-600 text-white px-3 py-2 rounded w-full focus:outline-none"
              placeholder="Nama"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
            />
            <select
              className="bg-[#222] border border-gray-600 text-white px-3 py-2 rounded w-full"
              value={kelas}
              onChange={(e) => setKelas(e.target.value)}
            >
              <option value="">Pilih Kelas</option>
              {[
                'Kelas 1A', 'Kelas 1B',
                'Kelas 2A', 'Kelas 2B',
                'Kelas 3A', 'Kelas 3B',
                'Kelas 4A', 'Kelas 4B',
                'Kelas 5A', 'Kelas 5B',
                'Kelas 6A', 'Kelas 6B',
              ].map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
            <select
              className="bg-[#222] border border-gray-600 text-white px-3 py-2 rounded w-full"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="">Pilih Gender</option>
              <option value="Laki-Laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
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
          value={filterKelas}
          onChange={(e) => setFilterKelas(e.target.value)}
        >
          <option value="">Semua Kelas</option>
          {kelasOptions.map((kls, i) => (
            <option key={i} value={kls}>{kls}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg shadow-sm">
        <table className="min-w-full text-sm bg-[#1a1a1a] border border-gray-700">
          <thead className="bg-[#222] text-orange-400">
            <tr>
              <th className="px-4 py-3 border border-gray-700 text-left">Nama</th>
              <th className="px-4 py-3 border border-gray-700 text-left">Kelas</th>
              <th className="px-4 py-3 border border-gray-700 text-left">Gender</th>
              <th className="px-4 py-3 border border-gray-700 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center text-gray-400 py-4">Belum ada data kelas.</td>
              </tr>
            ) : (
              filteredData.map((item, index) => (
                <tr key={item.id} className={index % 2 === 0 ? 'bg-[#1a1a1a]' : 'bg-[#181818]'}>
                  <td className="px-4 py-3 border border-gray-700 align-top">{item.nama}</td>
                  <td className="px-4 py-3 border border-gray-700 align-top">{item.kelas}</td>
                  <td className="px-4 py-3 border border-gray-700 align-top">{item.gender}</td>
                  <td className="px-4 py-3 border border-gray-700 text-center">
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
