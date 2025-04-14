'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, X, Edit, Trash2, Trophy } from 'lucide-react';

export default function LombaPage() {
  const [namaLomba, setNamaLomba] = useState('');
  const [jLomba, setJLomba] = useState('');
  const [nama, setNama] = useState('');
  const [gender, setGender] = useState('');
  const [link, setLink] = useState('');
  const [data, setData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data } = await supabase.from('lomba').select('*').order('created_at', { ascending: false });
    setData(data);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!namaLomba || !jLomba || !nama || !gender || !link) {
      alert("Lengkapi semua data");
      return;
    }

    const newData = { nama_lomba: namaLomba, j_lomba: jLomba, nama, gender, link };

    if (isEditing) {
      const { error } = await supabase.from("lomba").update(newData).eq('id', editId);
      if (error) return alert("Gagal mengedit data!");
      alert("Data berhasil diperbarui!");
    } else {
      const { error } = await supabase.from("lomba").insert(newData);
      if (error) return alert("Gagal menyimpan data!");
      alert("Data berhasil ditambahkan!");
    }

    resetForm();
    fetchData();
  };

  function resetForm() {
    setNamaLomba('');
    setJLomba('');
    setNama('');
    setGender('');
    setLink('');
    setEditId(null);
    setIsEditing(false);
    setShowForm(false);
  }

  async function deleteData(id) {
    const confirm = window.confirm("Yakin ingin menghapus data ini?");
    if (!confirm) return;
    await supabase.from('lomba').delete().eq('id', id);
    fetchData();
  }

  function startEdit(item) {
    setIsEditing(true);
    setEditId(item.id);
    setNamaLomba(item.nama_lomba);
    setJLomba(item.j_lomba);
    setNama(item.nama);
    setGender(item.gender);
    setLink(item.link);
    setShowForm(true);
  }

  return (
    <div className="p-4 sm:p-6 text-white bg-[#111] min-h-screen">
      <div className="flex items-center justify-between mb-6">
          <Trophy size={24} className="text-orange-400" />
          <h2 className="text-3xl font-semibold text-white tracking-wide">Lomba</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (isEditing) resetForm();
          }}
          className={`p-2 rounded-full ${showForm ? 'bg-red-600' : 'bg-orange-500'} hover:opacity-80 text-white`}
          title={showForm ? 'Tutup Form' : 'Tambah Lomba'}
        >
          {showForm ? <X size={20} /> : <Plus size={20} />}
        </button>
      </div>

      {showForm && (
        <div className="bg-[#1a1a1a] border border-gray-700 p-4 rounded-xl mb-8 shadow-sm">
          <h3 className="text-lg font-medium text-orange-400 mb-3">
            {isEditing ? 'Edit Data Lomba' : 'Form Tambah Lomba'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              className="bg-[#222] border border-gray-600 text-white px-3 py-2 rounded w-full"
              placeholder="Nama Lomba"
              value={namaLomba}
              onChange={(e) => setNamaLomba(e.target.value)}
            />
            <input
              className="bg-[#222] border border-gray-600 text-white px-3 py-2 rounded w-full"
              placeholder="Jenis Lomba"
              value={jLomba}
              onChange={(e) => setJLomba(e.target.value)}
            />
            <input
              className="bg-[#222] border border-gray-600 text-white px-3 py-2 rounded w-full"
              placeholder="Nama"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
            />
            <select
              className="bg-[#222] border border-gray-600 text-white px-3 py-2 rounded w-full"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="">Pilih Gender</option>
              <option value="Putra">Putra</option>
              <option value="Putri">Putri</option>
            </select>
            <input
              className="bg-[#222] border border-gray-600 text-white px-3 py-2 rounded w-full"
              placeholder="Link YouTube"
              value={link}
              onChange={(e) => setLink(e.target.value)}
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

      <div className="overflow-x-auto rounded-lg shadow-sm">
        <table className="min-w-full text-sm bg-[#1a1a1a] border border-gray-700">
          <thead className="bg-[#222] text-orange-400">
            <tr>
              <th className="px-4 py-3 border border-gray-700 text-left">Nama Lomba</th>
              <th className="px-4 py-3 border border-gray-700 text-left">Jenis</th>
              <th className="px-4 py-3 border border-gray-700 text-left">Nama</th>
              <th className="px-4 py-3 border border-gray-700 text-left">Gender</th>
              <th className="px-4 py-3 border border-gray-700 text-left">Link YouTube</th>
              <th className="px-4 py-3 border border-gray-700 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center text-gray-400 py-4">Belum ada data lomba.</td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={item.id} className={index % 2 === 0 ? 'bg-[#1a1a1a]' : 'bg-[#181818]'}>
                  <td className="px-4 py-3 border border-gray-700 align-top">{item.nama_lomba}</td>
                  <td className="px-4 py-3 border border-gray-700 align-top">{item.j_lomba}</td>
                  <td className="px-4 py-3 border border-gray-700 align-top">{item.nama}</td>
                  <td className="px-4 py-3 border border-gray-700 align-top">{item.gender}</td>
                  <td className="px-4 py-3 border border-gray-700 align-top">
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">Lihat Video</a>
                  </td>
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
