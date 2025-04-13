'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, X, Edit, Trash2 } from 'lucide-react';

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

      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, gambar);

      if (uploadError) {
        console.error("Upload error:", uploadError.message);
        return alert("Upload gambar gagal!");
      }

      const { data: urlData, error: urlError } = supabase.storage
        .from("images")
        .getPublicUrl(filePath);

      if (urlError) {
        console.error("URL error:", urlError.message);
        return alert("Gagal ambil URL gambar!");
      }

      imageUrl = urlData.publicUrl;
    }

    if (isEditing) {
      const updateData = {
        judul,
        tanggal,
        isi,
        gambar: imageUrl || data.find((item) => item.id === editId)?.gambar,
      };

      const { error } = await supabase.from("galeri").update(updateData).eq('id', editId);

      if (error) {
        console.error("Update error:", error.message);
        return alert("Gagal mengedit galeri!");
      }

      alert("Data galeri berhasil diperbarui!");
    } else {
      const { error: insertError } = await supabase.from("galeri").insert({
        judul,
        tanggal,
        isi,
        gambar: imageUrl,
      });

      if (insertError) {
        console.error("Insert error:", insertError.message);
        return alert("Gagal menyimpan galeri!");
      }

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
    const confirm = window.confirm("Yakin ingin menghapus data ini?");
    if (!confirm) return;

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
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Manajemen Galeri</h2>
        <button 
          onClick={() => {
            setShowForm(!showForm);
            if (isEditing) resetForm();
          }} 
          className={`p-2 rounded-full text-white ${showForm ? 'bg-red-500' : 'bg-green-600'} hover:opacity-80`}
          title={showForm ? 'Tutup Form' : 'Tambah Galeri'}
        >
          {showForm ? <X size={20} /> : <Plus size={20} />}
        </button>
      </div>

      {showForm && (
        <div className="bg-white shadow-md p-6 rounded-lg mb-10 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">
            {isEditing ? 'Edit Galeri' : 'Form Tambah Galeri'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              className="border p-2 w-full rounded"
              placeholder="Judul"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
            />
            <input
              type="date"
              className="border p-2 w-full rounded"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
            />
            <textarea
              className="border p-2 w-full rounded"
              placeholder="Isi Singkat"
              value={isi}
              onChange={(e) => setIsi(e.target.value)}
            />
            <input type="file" onChange={(e) => setGambar(e.target.files[0])} />
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
              <th className="px-4 py-3 border">Judul</th>
              <th className="px-4 py-3 border">Isi</th>
              <th className="px-4 py-3 border">Tanggal</th>
              <th className="px-4 py-3 border">Gambar</th>
              <th className="px-4 py-3 border text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-4">Belum ada data galeri.</td>
              </tr>
            )}
            {data.map((item, index) => (
              <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-3 border align-top">{item.judul}</td>
                <td className="px-4 py-3 border align-top">{item.isi}</td>
                <td className="px-4 py-3 border align-top">{item.tanggal}</td>
                <td className="px-4 py-3 border text-center">
                  <img src={item.gambar} alt="gambar" className="w-24 mx-auto rounded" />
                </td>
                <td className="px-4 py-3 border text-center">
                  <div className="flex justify-center space-x-2">
                    <button onClick={() => startEdit(item)} title="Edit" className="text-yellow-500 hover:text-yellow-600">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => deleteGaleri(item.id)} title="Hapus" className="text-red-600 hover:text-red-700">
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
