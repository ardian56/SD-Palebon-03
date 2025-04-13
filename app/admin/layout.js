// app/admin/layout.js
import '../globals.css';

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-800 text-white flex flex-col p-4 space-y-2">
        <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
        <a href="/admin/" className="hover:bg-gray-700 p-2 rounded">Dashboard</a>
        <a href="/admin/berita" className="hover:bg-gray-700 p-2 rounded">Berita</a>
        <a href="/admin/galeri" className="hover:bg-gray-700 p-2 rounded">Galeri</a>
        <a href="/admin/guru" className="hover:bg-gray-700 p-2 rounded">Profil Guru</a>
        <a href="/admin/kelas" className="hover:bg-gray-700 p-2 rounded">Kelas</a>
        <a href="/admin/lomba" className="hover:bg-gray-700 p-2 rounded">Lomba</a>
      </aside>
      <main className="flex-1 bg-gray-100 p-6">
        {children}
      </main>
    </div>
  );
}
