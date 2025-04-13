'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, X, Edit, Trash2 } from 'lucide-react';

export default function GuruPage() {
  const [nama, setNama] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [foto, setFoto] = useState(null);
  const [data, setData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchGuru();
  }, []);

  async function fetchGuru() {
    const { data } = await supabase.from('guru').select('*').order('created_at', { ascending: false });
    setData(data);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nama || !jabatan || (!foto && !isEditing)) {
      alert("Lengkapi semua data");
      return;
    }

    let fotoUrl = null;

    if (foto) {
      const fileExt = foto.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `guru/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, foto);

      if (uploadError) {
        console.error('Upload error:', uploadError.message);
        return alert('Upload foto gagal!');
      }

      const { data: urlData, error: urlError } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      if (urlError) {
        console.error('URL error:', urlError.message);
        return alert('Gagal ambil URL foto!');
      }

      fotoUrl = urlData.publicUrl;
    }

    if (isEditing) {
      const updateData = {
        nama,
        jabatan,
        foto: fotoUrl || data.find((item) => item.id === editId)?.foto,
      };

      const { error } = await supabase.from('guru').update(updateData).eq('id', editId);

      if (error) {
        console.error('Update error:', error.message);
        return alert('Gagal mengedit data guru!');
      }

      alert('Data guru berhasil diperbarui!');
    } else {
      const { error: insertError } = await supabase.from('guru').insert({
        nama,
        jabatan,
        foto: fotoUrl,
      });

      if (insertError) {
        console.error('Insert error:', insertError.message);
        return alert('Gagal menyimpan data guru!');
      }

      alert('Guru berhasil ditambahkan!');
    }

    resetForm();
    fetchGuru();
  };

  function resetForm() {
    setNama('');
    setJabatan('');
    setFoto(null);
    setEditId(null);
    setIsEditing(false);
    setShowForm(false);
  }

  async function deleteGuru(id) {
    const confirm = window.confirm('Yakin ingin menghapus data ini?');
    if (!confirm) return;

    await supabase.from('guru').delete().eq('id', id);
    fetchGuru();
  }

  function startEdit(item) {
    setIsEditing(true);
    setEditId(item.id);
    setNama(item.nama);
    setJabatan(item.jabatan);
    setShowForm(true);
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Manajemen Guru</h2>
        <button 
          onClick={() => {
            setShowForm(!showForm);
            if (isEditing) resetForm();
          }} 
          className={`p-2 rounded-full text-white ${showForm ? 'bg-red-500' : 'bg-green-600'} hover:opacity-80`}
          title={showForm ? 'Tutup Form' : 'Tambah Guru'}
        >
          {showForm ? <X size={20} /> : <Plus size={20} />}
        </button>
      </div>

      {showForm && (
        <div className="bg-white shadow-md p-6 rounded-lg mb-10 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">
            {isEditing ? 'Edit Guru' : 'Form Tambah Guru'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              className="border p-2 w-full rounded"
              placeholder="Nama"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
            />
            <input
              className="border p-2 w-full rounded"
              placeholder="Jabatan"
              value={jabatan}
              onChange={(e) => setJabatan(e.target.value)}
            />
            <input type="file" onChange={(e) => setFoto(e.target.files[0])} />
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
              <th className="px-4 py-3 border">Nama</th>
              <th className="px-4 py-3 border">Jabatan</th>
              <th className="px-4 py-3 border">Foto</th>
              <th className="px-4 py-3 border text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-4">Belum ada data guru.</td>
              </tr>
            )}
            {data.map((item, index) => (
              <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-3 border align-top">{item.nama}</td>
                <td className="px-4 py-3 border align-top">{item.jabatan}</td>
                <td className="px-4 py-3 border text-center">
                  <img src={item.foto} alt="foto" className="w-20 mx-auto rounded" />
                </td>
                <td className="px-4 py-3 border text-center">
                  <div className="flex justify-center space-x-2">
                    <button onClick={() => startEdit(item)} title="Edit" className="text-yellow-500 hover:text-yellow-600">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => deleteGuru(item.id)} title="Hapus" className="text-red-600 hover:text-red-700">
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
