'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, X, Edit, Trash2, Image } from 'lucide-react';

export default function GaleriPage() {
  const [judul, setJudul] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [isi, setIsi] = useState('');
  const [gambar, setGambar] = useState(null);
  const [data, setData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchGaleri();
  }, []);

  async function fetchGaleri() {
    const { data } = await supabase.from('galeri').select('*').order('created_at', { ascending: false });
    setData(data);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!judul || !tanggal || !isi || (!gambar && !isEditing)) {
      alert("Lengkapi semua data");
      return;
    }

    let imageUrl = null;

    if (gambar) {
      const fileExt = gambar.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `galeri/${fileName}`;

      const { error: uploadError } = await supabase.storage.from("images").upload(filePath, gambar);
      if (uploadError) return alert("Upload gambar gagal!");

      const { data: urlData } = supabase.storage.from("images").getPublicUrl(filePath);
      imageUrl = urlData.publicUrl;
    }

    if (isEditing) {
      await supabase.from("galeri").update({
        judul, tanggal, isi,
        gambar: imageUrl || data.find((item) => item.id === editId)?.gambar,
      }).eq('id', editId);
      alert("Data galeri berhasil diperbarui!");
    } else {
      await supabase.from("galeri").insert({ judul, tanggal, isi, gambar: imageUrl });
      alert("Galeri berhasil ditambahkan!");
    }

    resetForm();
    fetchGaleri();
  };

  function resetForm() {
    setJudul('');
    setTanggal('');
    setIsi('');
    setGambar(null);
    setEditId(null);
    setIsEditing(false);
    setShowForm(false);
  }

  async function deleteGaleri(id) {
    if (!confirm("Yakin ingin menghapus data ini?")) return;
    await supabase.from('galeri').delete().eq('id', id);
    fetchGaleri();
  }

  function startEdit(item) {
    setIsEditing(true);
    setEditId(item.id);
    setJudul(item.judul);
    setTanggal(item.tanggal);
    setIsi(item.isi);
    setShowForm(true);
  }

  return (
    <div className="p-4 sm:p-6 text-white bg-[#111] min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <Image size={24} className="text-orange-400" />
        <h2 className="text-3xl font-semibold text-white tracking-wide">
          Galeri
        </h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (isEditing) resetForm();
          }}
          className={`p-2 rounded-full ${showForm ? 'bg-red-600' : 'bg-orange-500'} hover:opacity-80 text-white`}
          title={showForm ? 'Tutup Form' : 'Tambah Galeri'}
        >
          {showForm ? <X size={20} /> : <Plus size={20} />}
        </button>
      </div>

      {showForm && (
        <div className="bg-[#1a1a1a] border border-gray-700 p-4 rounded-xl mb-8 shadow-sm">
          <h3 className="text-lg font-medium text-orange-400 mb-3">
            {isEditing ? 'Edit Galeri' : 'Form Tambah Galeri'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              className="bg-[#222] border border-gray-600 text-white px-3 py-2 rounded w-full focus:outline-none"
              placeholder="Judul"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
            />
            <input
              type="date"
              className="bg-[#222] border border-gray-600 text-white px-3 py-2 rounded w-full focus:outline-none"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
            />
            <textarea
              className="bg-[#222] border border-gray-600 text-white px-3 py-2 rounded w-full focus:outline-none"
              placeholder="Isi Singkat"
              value={isi}
              onChange={(e) => setIsi(e.target.value)}
            />
            <input
              type="file"
              onChange={(e) => setGambar(e.target.files[0])}
              className="text-sm text-gray-300"
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
              <th className="px-4 py-3 border border-gray-700 text-left">Judul</th>
              <th className="px-4 py-3 border border-gray-700 text-left">Isi</th>
              <th className="px-4 py-3 border border-gray-700 text-left">Tanggal</th>
              <th className="px-4 py-3 border border-gray-700 text-center">Gambar</th>
              <th className="px-4 py-3 border border-gray-700 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center text-gray-400 py-4">Belum ada data galeri.</td>
              </tr>
            )}
            {data.map((item, index) => (
              <tr key={item.id} className={index % 2 === 0 ? 'bg-[#1a1a1a]' : 'bg-[#181818]'}>
                <td className="px-4 py-3 border border-gray-700 align-top">{item.judul}</td>
                <td className="px-4 py-3 border border-gray-700 align-top">{item.isi}</td>
                <td className="px-4 py-3 border border-gray-700 align-top">{item.tanggal}</td>
                <td className="px-4 py-3 border border-gray-700 text-center">
                  <img src={item.gambar} alt="gambar" className="w-20 mx-auto rounded" />
                </td>
                <td className="px-4 py-3 border border-gray-700 text-center">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => startEdit(item)} title="Edit" className="text-yellow-400 hover:text-yellow-300">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => deleteGaleri(item.id)} title="Hapus" className="text-red-500 hover:text-red-400">
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
