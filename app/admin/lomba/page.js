'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, X, Edit, Trash2 } from 'lucide-react';

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

    const newData = {
      nama_lomba: namaLomba,
      j_lomba: jLomba,
      nama,
      gender,
      link,
    };

    if (isEditing) {
      const { error } = await supabase.from("lomba").update(newData).eq('id', editId);
      if (error) {
        console.error("Update error:", error.message);
        return alert("Gagal mengedit data lomba!");
      }
      alert("Data lomba berhasil diperbarui!");
    } else {
      const { error } = await supabase.from("lomba").insert(newData);
      if (error) {
        console.error("Insert error:", error.message);
        return alert("Gagal menyimpan data lomba!");
      }
      alert("Data lomba berhasil ditambahkan!");
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
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Manajemen Lomba</h2>
        <button 
          onClick={() => {
            setShowForm(!showForm);
            if (isEditing) resetForm();
          }} 
          className={`p-2 rounded-full text-white ${showForm ? 'bg-red-500' : 'bg-green-600'} hover:opacity-80`}
          title={showForm ? 'Tutup Form' : 'Tambah Data'}
        >
          {showForm ? <X size={20} /> : <Plus size={20} />}
        </button>
      </div>

      {showForm && (
        <div className="bg-white shadow-md p-6 rounded-lg mb-10 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">
            {isEditing ? 'Edit Data Lomba' : 'Form Tambah Data Lomba'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input className="border p-2 w-full rounded" placeholder="Nama Lomba" value={namaLomba} onChange={(e) => setNamaLomba(e.target.value)} />
            <input className="border p-2 w-full rounded" placeholder="Jenis Lomba" value={jLomba} onChange={(e) => setJLomba(e.target.value)} />
            <input className="border p-2 w-full rounded" placeholder="Nama" value={nama} onChange={(e) => setNama(e.target.value)} />
            <select className="border p-2 w-full rounded" value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="">Pilih </option>
              <option value="Putra">Putra</option>
              <option value="Putri">Putri</option>
            </select>
            <input className="border p-2 w-full rounded" placeholder="Link YouTube" value={link} onChange={(e) => setLink(e.target.value)} />
            <div className="flex items-center space-x-2">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                {isEditing ? 'Update' : 'Simpan'}
              </button>
              {isEditing && (
                <button onClick={resetForm} type="button" className="text-sm text-gray-500 underline">
                  Batal Edit
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-lg overflow-hidden shadow-sm text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-3 border">Nama Lomba</th>
              <th className="px-4 py-3 border">Jenis</th>
              <th className="px-4 py-3 border">Nama</th>
              <th className="px-4 py-3 border">Gender</th>
              <th className="px-4 py-3 border">Link YouTube</th>
              <th className="px-4 py-3 border text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-4">Belum ada data lomba.</td>
              </tr>
            )}
            {data.map((item, index) => (
              <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-3 border">{item.nama_lomba}</td>
                <td className="px-4 py-3 border">{item.j_lomba}</td>
                <td className="px-4 py-3 border">{item.nama}</td>
                <td className="px-4 py-3 border">{item.gender}</td>
                <td className="px-4 py-3 border">
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Lihat Video</a>
                </td>
                <td className="px-4 py-3 border text-center">
                  <div className="flex justify-center space-x-2">
                    <button onClick={() => startEdit(item)} title="Edit" className="text-yellow-500 hover:text-yellow-600">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => deleteData(item.id)} title="Hapus" className="text-red-600 hover:text-red-700">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
