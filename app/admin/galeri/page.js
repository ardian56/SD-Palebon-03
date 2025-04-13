// app/admin/galeri/page.jsx
export default function Galeri() {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Galeri Foto</h1>
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="border px-4 py-2">Judul</th>
              <th className="border px-4 py-2">Gambar</th>
              <th className="border px-4 py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-4 py-2">Upacara Bendera</td>
              <td className="border px-4 py-2">[gambar.jpg]</td>
              <td className="border px-4 py-2">Edit | Hapus</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
  