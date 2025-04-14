'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, X, Edit, Trash2, Users } from 'lucide-react';

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
    const { data } = await supabase
      .from('guru')
      .select('*')
      .order('created_at', { ascending: false });
    setData(data);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nama || !jabatan || (!foto && !isEditing)) {
      alert('Lengkapi semua data');
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
    <div className="p-4 text-white">
      <div className="flex justify-between items-center mb-4">
      <Users size={24} className="text-orange-400" />
        <h2 className="text-3xl font-semibold text-white tracking-wide">
          Profil Guru
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
                placeholder="Nama"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
              />
            </div>
            <div>
              <input
                className="w-full p-2 rounded bg-[#2b2b2b] text-white border border-gray-600"
                placeholder="Jabatan"
                value={jabatan}
                onChange={(e) => setJabatan(e.target.value)}
              />
            </div>
            <div>
              <input
                type="file"
                className="text-sm"
                onChange={(e) => setFoto(e.target.files[0])}
              />
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" className="bg-orange-500 px-4 py-2 rounded text-white hover:bg-orange-600">
                {isEditing ? 'Update' : 'Simpan'}
              </button>
              {isEditing && (
                <button type="button" onClick={resetForm} className="text-sm underline text-gray-400">
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
              <th className="p-3 border-b border-gray-700 text-left">Nama</th>
              <th className="p-3 border-b border-gray-700 text-left">Jabatan</th>
              <th className="p-3 border-b border-gray-700 text-center">Foto</th>
              <th className="p-3 border-b border-gray-700 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-400">Belum ada data guru.</td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={item.id} className={index % 2 === 0 ? 'bg-[#1e1e1e]' : 'bg-[#252525]'}>
                  <td className="p-3 border-b border-gray-700">{item.nama}</td>
                  <td className="p-3 border-b border-gray-700">{item.jabatan}</td>
                  <td className="p-3 border-b border-gray-700 text-center">
                    <img src={item.foto} alt="foto" className="w-16 h-16 object-cover rounded mx-auto" />
                  </td>
                  <td className="p-3 border-b border-gray-700 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => startEdit(item)} title="Edit" className="text-yellow-400 hover:text-yellow-300">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => deleteGuru(item.id)} title="Hapus" className="text-red-500 hover:text-red-400">
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
