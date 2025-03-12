"use client";

import { useState, useEffect } from "react";

export default function NewsPage() {
  const [news, setNews] = useState([]);

  // Ambil data berita dari API Supabase
  useEffect(() => {
    async function fetchNews() {
      const res = await fetch("/api/news");
      const data = await res.json();
      setNews(data);
    }
    fetchNews();
  }, []);

  // Fungsi Hapus Berita
  async function deleteNews(id) {
    if (!confirm("Apakah yakin ingin menghapus berita ini?")) return;
    await fetch(`/api/news/${id}`, { method: "DELETE" });
    setNews(news.filter((item) => item.id !== id));
  }

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Manajemen Berita</h1>

      {/* Tombol Tambah Berita */}
      <button className="bg-blue-500 text-white px-4 py-2 rounded mb-4">
        Tambah Berita
      </button>

      {/* Tabel Berita */}
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Judul</th>
            <th className="border p-2">Tanggal</th>
            <th className="border p-2">Isi</th>
            <th className="border p-2">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {news.map((item) => (
            <tr key={item.id}>
              <td className="border p-2">{item.title}</td>
              <td className="border p-2">{item.date}</td>
              <td className="border p-2">{item.content}</td>
              <td className="border p-2">
                <button className="bg-yellow-500 text-white px-3 py-1 rounded mr-2">
                  Edit
                </button>
                <button
                  onClick={() => deleteNews(item.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Hapus
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
