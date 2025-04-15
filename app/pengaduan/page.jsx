'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const PengaduanPage = () => {
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    subjek: '',
    pesan: ''
  });
  const [aduanList, setAduanList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { nama, email, subjek, pesan } = formData;

    if (!nama || !email || !subjek || !pesan) {
      alert("Semua field harus diisi!");
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.from('pengaduan').insert([{ nama, email, subjek, pesan }]);

    if (error) {
      alert('Terjadi kesalahan saat mengirim pengaduan.');
    } else {
      setFormData({ nama: '', email: '', subjek: '', pesan: '' });
      fetchData();
    }

    setIsLoading(false);
  };

  const fetchData = async () => {
    const { data, error } = await supabase
      .from('pengaduan')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(4);

    if (!error) {
      setAduanList(data);
    } else {
      alert('Terjadi kesalahan saat mengambil data pengaduan.');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const maskNama = (nama) => {
    if (!nama) return '';
    return nama[0] + '*'.repeat(nama.length - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-3xl shadow-2xl mt-16">
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-8">Form Pengaduan</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
            <input
              type="text"
              name="nama"
              value={formData.nama}
              onChange={handleChange}
              className="w-full p-3 border border-gray-700 text-gray-700 rounded-xl shadow-sm bg-gray-50"
              placeholder="Masukkan nama"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-xl text-gray-700 shadow-sm bg-gray-50"
              placeholder="Masukkan email"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subjek</label>
            <input
              type="text"
              name="subjek"
              value={formData.subjek}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-xl shadow-sm bg-gray-50 text-gray-700"
              placeholder="Subjek pengaduan"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Isi Pengaduan</label>
            <textarea
              name="pesan"
              value={formData.pesan}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-xl shadow-sm text-gray-700 bg-gray-50"
              rows={4}
              placeholder="Tulis pengaduan Anda di sini..."
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-5 py-3 rounded-xl shadow hover:bg-blue-700 transition"
            disabled={isLoading}
          >
            {isLoading ? 'Mengirim...' : 'Kirim Pengaduan'}
          </button>
        </form>
      </div>

      {/* Daftar Aduan */}
      <div className="max-w-3xl mx-auto mt-12">
        <h3 className="text-2xl font-semibold text-gray-800 mb-6">Daftar Pengaduan</h3>
        <div className="grid gap-4">
          {aduanList.map((aduan) => (
            <div
              key={aduan.id}
              className="bg-white p-5 rounded-xl shadow-md border border-gray-200"
            >
              <div className="text-sm text-gray-500 mb-1">Nama: {maskNama(aduan.nama)}</div>
              <div className="font-semibold text-gray-800">{aduan.subjek}</div>
              <div className="text-gray-700 mt-1">{aduan.pesan}</div>
              <div className="text-xs text-gray-400 text-right mt-3">
                {aduan.created_at ? new Date(aduan.created_at).toLocaleString() : ''}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PengaduanPage;
