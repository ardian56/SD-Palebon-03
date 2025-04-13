'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function BeritaPage() {
  const [judul, setJudul] = useState('');
  const [isi, setIsi] = useState('');
  const [gambar, setGambar] = useState(null);
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchBerita();
  }, []);

  async function fetchBerita() {
    const { data } = await supabase.from('berita').select('*').order('created_at', { ascending: false });
    setData(data);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!judul || !isi || !gambar) {
      alert("Lengkapi semua data");
      return;
    }
  
    const fileExt = gambar.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `berita/${fileName}`;
  
    // 1. Upload gambar ke Supabase
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("images")
      .upload(filePath, gambar);
  
    if (uploadError) {
      console.error("Upload error:", uploadError.message);
      return alert("Upload gagal!");
    }
  
    // 2. Ambil URL publik gambar
    const { data: urlData } = supabase.storage.from("images").getPublicUrl(filePath);
    const imageUrl = urlData.publicUrl;
  
    // 3. Simpan data ke tabel 'berita'
    const { error: insertError } = await supabase.from("berita").insert({
      judul,
      isi,
      gambar: imageUrl,
    });
  
    if (insertError) {
      console.error("Insert error:", insertError.message);
      return alert("Gagal simpan berita!");
    }
  
    alert("Berita berhasil ditambahkan!");
    // refresh atau redirect
  };
  

  async function deleteBerita(id) {
    await supabase.from('berita').delete().eq('id', id);
    fetchBerita();
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Tambah Berita</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input className="border p-2 w-full" placeholder="Judul" value={judul} onChange={(e) => setJudul(e.target.value)} />
        <textarea className="border p-2 w-full" placeholder="Isi" value={isi} onChange={(e) => setIsi(e.target.value)} />
        <input type="file" onChange={(e) => setGambar(e.target.files[0])} />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Simpan</button>
      </form>

      <h2 className="text-xl font-bold mt-10 mb-4">Daftar Berita</h2>
      {data.map((item) => (
        <div key={item.id} className="border p-4 mb-4">
          <h3 className="text-lg font-semibold">{item.judul}</h3>
          <img src={item.gambar} alt="" className="w-48 my-2" />
          <p>{item.isi}</p>
          <button onClick={() => deleteBerita(item.id)} className="text-red-500 mt-2">Hapus</button>
        </div>
      ))}
    </div>
  );
}
