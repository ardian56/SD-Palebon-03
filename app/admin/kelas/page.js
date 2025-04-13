// app/admin/kelas/page.jsx
export default function Kelas() {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Data Kelas</h1>
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="border px-4 py-2">Nama Kelas</th>
              <th className="border px-4 py-2">Wali Kelas</th>
              <th className="border px-4 py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-4 py-2">X IPA 1</td>
              <td className="border px-4 py-2">Pak Dedi</td>
              <td className="border px-4 py-2">Edit | Hapus</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
  