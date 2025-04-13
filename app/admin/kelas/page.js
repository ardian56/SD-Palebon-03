'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, X, Edit, Trash2 } from 'lucide-react';

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
      const { error } = await supabase.from('kelas').update({ nama, kelas, gender }).eq('id', editId);
      if (error) return alert('Gagal update data!');
      alert('Data berhasil diperbarui!');
    } else {
      const { error } = await supabase.from('kelas').insert({ nama, kelas, gender });
      if (error) return alert('Gagal menyimpan data!');
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
    const confirm = window.confirm('Yakin ingin menghapus data ini?');
    if (!confirm) return;
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
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Manajemen Kelas</h2>
        <button 
          onClick={() => {
            setShowForm(!showForm);
            if (isEditing) resetForm();
          }}
          className={`p-2 rounded-full text-white ${showForm ? 'bg-red-500' : 'bg-green-600'} hover:opacity-80`}
        >
          {showForm ? <X size={20} /> : <Plus size={20} />}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6 border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              className="border p-2 w-full rounded"
              placeholder="Nama"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
            />
            <select
                className="border p-2 w-full rounded"
                value={kelas}
                onChange={(e) => setKelas(e.target.value)}
                >
                <option value="">Pilih Kelas</option>
                <option value="Kelas 1A">Kelas 1A</option>
                <option value="Kelas 1B">Kelas 1B</option>
                <option value="Kelas 2A">Kelas 2A</option>
                <option value="Kelas 2B">Kelas 2B</option>
                <option value="Kelas 3A">Kelas 3A</option>
                <option value="Kelas 3B">Kelas 3B</option>
                <option value="Kelas 4A">Kelas 4A</option>
                <option value="Kelas 4B">Kelas 4B</option>
                <option value="Kelas 5A">Kelas 5A</option>
                <option value="Kelas 5B">Kelas 5B</option>
                <option value="Kelas 6A">Kelas 6A</option>
                <option value="Kelas 6B">Kelas 6B</option>
            </select>

            <select
              className="border p-2 w-full rounded"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="">Pilih Gender</option>
              <option value="Laki-Laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
              {isEditing ? 'Update' : 'Simpan'}
            </button>
          </form>
        </div>
      )}

      <div className="mb-4">
        <label className="block mb-1 font-medium">Filter Kelas:</label>
        <select
          className="border p-2 rounded w-full max-w-xs"
          value={filterKelas}
          onChange={(e) => setFilterKelas(e.target.value)}
        >
          <option value="">Semua Kelas</option>
          {kelasOptions.map((kls, i) => (
            <option key={i} value={kls}>{kls}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border text-sm rounded shadow">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-3 border">Nama</th>
              <th className="px-4 py-3 border">Kelas</th>
              <th className="px-4 py-3 border">Gender</th>
              <th className="px-4 py-3 border text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-4">Belum ada data kelas.</td>
              </tr>
            ) : (
              filteredData.map((item, index) => (
                <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 border">{item.nama}</td>
                  <td className="px-4 py-3 border">{item.kelas}</td>
                  <td className="px-4 py-3 border">{item.gender}</td>
                  <td className="px-4 py-3 border text-center">
                    <div className="flex justify-center space-x-2">
                      <button onClick={() => startEdit(item)} className="text-yellow-500 hover:text-yellow-600">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => deleteData(item.id)} className="text-red-600 hover:text-red-700">
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
