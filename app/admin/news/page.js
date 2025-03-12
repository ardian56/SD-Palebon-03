"use client";

import Sidebar from "@/components/Sidebar";
import { useEffect, useState } from "react";

export default function NewsPage() {
  const [news, setNews] = useState([]);

  // Ambil data berita dari API
  useEffect(() => {
    async function fetchNews() {
      const res = await fetch("/api/news");
      const data = await res.json();
      setNews(data);
    }

    fetchNews();
  }, []);

  // Fungsi hapus berita
  async function deleteNews(id) {
    if (!confirm("Yakin ingin menghapus berita ini?")) return;

    const res = await fetch("/api/news", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (res.ok) {
      alert("Berita berhasil dihapus!");
      setNews(news.filter((item) => item.id !== id)); // Hapus dari state
    } else {
      alert("Gagal menghapus berita");
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-10">
        <h1 className="text-2xl font-bold mb-4">Manajemen Berita</h1>

        {/* Tabel berita */}
        <table className="w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-4 py-2">Judul</th>
              <th className="border px-4 py-2">Gambar</th>
              <th className="border px-4 py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {news.length > 0 ? (
              news.map((item) => (
                <tr key={item.id} className="border">
                  <td className="border px-4 py-2">{item.title}</td>
                  <td className="border px-4 py-2">
                    <img src={item.image_url} alt={item.title} className="w-16 h-16 object-cover" />
                  </td>
                  <td className="border px-4 py-2">
                    <button
                      onClick={() => deleteNews(item.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center py-4">
                  Tidak ada berita
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </main>
    </div>
  );
}
