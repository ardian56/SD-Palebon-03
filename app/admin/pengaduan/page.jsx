'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, X, Edit, Trash2, Mail } from 'lucide-react';

export default function PengaduanPage() {
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [subjek, setSubjek] = useState('');
  const [pesan, setPesan] = useState('');
  const [data, setData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data } = await supabase.from('pengaduan').select('*').order('created_at', { ascending: false });
    setData(data);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nama || !email || !subjek || !pesan) return alert('Semua field wajib diisi!');

    if (isEditing) {
      await supabase.from('pengaduan').update({ nama, email, subjek, pesan }).eq('id', editId);
      alert('Data berhasil diperbarui!');
    } else {
      await supabase.from('pengaduan').insert({ nama, email, subjek, pesan });
      alert('Data berhasil ditambahkan!');
    }

    resetForm();
    fetchData();
  };

  function resetForm() {
    setNama('');
    setEmail('');
    setSubjek('');
    setPesan('');
    setEditId(null);
    setIsEditing(false);
    setShowForm(false);
  }

  async function deleteData(id) {
    const confirmDelete = window.confirm('Yakin ingin menghapus pengaduan ini?');
    if (!confirmDelete) return;
    await supabase.from('pengaduan').delete().eq('id', id);
    fetchData();
  }

  function startEdit(item) {
    setIsEditing(true);
    setEditId(item.id);
    setNama(item.nama);
    setEmail(item.email);
    setSubjek(item.subjek);
    setPesan(item.pesan);
    setShowForm(true);
  }

  return (
    <div className="p-4 sm:p-6 text-white bg-[#111] min-h-screen">
      <div className="flex items-center justify-between mb-6">
          <Mail size={24} className="text-orange-400" />
          <h2 className="text-3xl font-semibold text-white tracking-wide">Pengaduan</h2>

        <button
          onClick={() => {
            setShowForm(!showForm);
            if (isEditing) resetForm();
          }}
          className={`p-2 rounded-full ${showForm ? 'bg-red-600' : 'bg-orange-500'} hover:opacity-80 text-white`}
          title={showForm ? 'Tutup Form' : 'Tambah Pengaduan'}
        >
          {showForm ? <X size={20} /> : <Plus size={20} />}
        </button>
      </div>

      {showForm && (
        <div className="bg-[#1a1a1a] border border-gray-700 p-4 rounded-xl mb-8 shadow-sm">
          <h3 className="text-lg font-medium text-orange-400 mb-3">
            {isEditing ? 'Edit Pengaduan' : 'Form Tambah Pengaduan'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              className="bg-[#222] border border-gray-600 text-white px-3 py-2 rounded w-full"
              placeholder="Nama"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
            />
            <input
              className="bg-[#222] border border-gray-600 text-white px-3 py-2 rounded w-full"
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="bg-[#222] border border-gray-600 text-white px-3 py-2 rounded w-full"
              placeholder="Subjek"
              value={subjek}
              onChange={(e) => setSubjek(e.target.value)}
            />
            <textarea
              className="bg-[#222] border border-gray-600 text-white px-3 py-2 rounded w-full"
              placeholder="Pesan"
              rows={4}
              value={pesan}
              onChange={(e) => setPesan(e.target.value)}
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
              <th className="px-4 py-3 border border-gray-700 text-left">Nama</th>
              <th className="px-4 py-3 border border-gray-700 text-left">Email</th>
              <th className="px-4 py-3 border border-gray-700 text-left">Subjek</th>
              <th className="px-4 py-3 border border-gray-700 text-left">Pesan</th>
              <th className="px-4 py-3 border border-gray-700 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center text-gray-400 py-4">Belum ada pengaduan masuk.</td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={item.id} className={index % 2 === 0 ? 'bg-[#1a1a1a]' : 'bg-[#181818]'}>
                  <td className="px-4 py-3 border border-gray-700 align-top">{item.nama}</td>
                  <td className="px-4 py-3 border border-gray-700 align-top">{item.email}</td>
                  <td className="px-4 py-3 border border-gray-700 align-top">{item.subjek}</td>
                  <td className="px-4 py-3 border border-gray-700 align-top whitespace-pre-line">{item.pesan}</td>
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
