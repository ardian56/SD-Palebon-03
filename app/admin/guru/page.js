// app/admin/guru/page.jsx
export default function Guru() {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Profil Guru</h1>
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="border px-4 py-2">Nama</th>
              <th className="border px-4 py-2">Mata Pelajaran</th>
              <th className="border px-4 py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-4 py-2">Ibu Sari</td>
              <td className="border px-4 py-2">Bahasa Indonesia</td>
              <td className="border px-4 py-2">Edit | Hapus</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
  