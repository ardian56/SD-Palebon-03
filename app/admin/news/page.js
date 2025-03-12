"use client";

import { useState, useEffect } from "react";

export default function NewsPage() {
  const [news, setNews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [image, setImage] = useState(null);

  useEffect(() => {
    fetch("/api/news")
      .then((res) => res.json())
      .then((data) => setNews(data));
  }, []);

  const addNews = async () => {
    const formData = new FormData();
    formData.append("title", newTitle);
    formData.append("content", newContent);
    formData.append("image", image);

    const res = await fetch("/api/news", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const newNews = await res.json();
      setNews([...news, newNews]);
      setShowForm(false);
    }
  };

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">Daftar Berita</h1>

      {/* Tombol Tambah Berita */}
      <button
        onClick={() => setShowForm(true)}
        className="bg-blue-500 text-white px-3 py-2 rounded mb-4 hover:bg-blue-600"
      >
        + Tambah Berita
      </button>

      {/* Form Tambah Berita */}
      {showForm && (
        <div className="p-4 bg-gray-100 rounded shadow">
          <input
            type="text"
            placeholder="Judul Berita"
            className="border p-2 w-full mb-2"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <textarea
            placeholder="Isi Berita"
            className="border p-2 w-full mb-2"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
          />
          <input
            type="file"
            className="border p-2 w-full mb-2"
            onChange={(e) => setImage(e.target.files[0])}
          />
          <button
            onClick={addNews}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Simpan
          </button>
        </div>
      )}

      {/* Tabel Berita */}
      <table className="w-full border-collapse border mt-4">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Judul</th>
            <th className="border p-2">Isi</th>
            <th className="border p-2">Gambar</th>
          </tr>
        </thead>
        <tbody>
          {news.map((item) => (
            <tr key={item.id}>
              <td className="border p-2">{item.title}</td>
              <td className="border p-2">{item.content}</td>
              <td className="border p-2">
                {item.image_url ? (
                  <img src={item.image_url} alt="News" className="w-20 h-20 object-cover" />
                ) : (
                  "Tidak ada gambar"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
