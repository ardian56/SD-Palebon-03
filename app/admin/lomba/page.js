// app/admin/lomba/page.jsx
export default function Lomba() {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Data Lomba</h1>
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="border px-4 py-2">Nama Lomba</th>
              <th className="border px-4 py-2">Tanggal</th>
              <th className="border px-4 py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-4 py-2">Lomba Cerdas Cermat</td>
              <td className="border px-4 py-2">2025-05-01</td>
              <td className="border px-4 py-2">Edit | Hapus</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
  