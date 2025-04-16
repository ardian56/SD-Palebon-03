import React from 'react'

const page = () => {
  return (
    <div className='bg-white/90 backdrop:backdrop-blur-md min-h-screen w-full'>
      {/* Header */}
      <div className="sm:w-2/3 mx-auto pt-24 mb-10 text-center">
        <h3 className='text-3xl font-bold text-gray-900'>PPDB SDN Palebon 03</h3>
        <h3 className='text-2xl font-semibold text-red-600 mt-2'>Tahun Ajaran 2025/2026</h3>
      </div>

      {/* Informasi Umum */}
      <div className="bg-white w-11/12 md:w-3/4 mx-auto p-6 shadow-lg border border-gray-200 rounded-2xl mb-8">
        <h4 className='text-2xl font-semibold text-red-700 mb-2'>Informasi Umum</h4>
        <p className='text-gray-600 leading-relaxed'>
          SDN Palebon 03 membuka pendaftaran peserta didik baru tahun ajaran 2025/2026. Pendaftaran dilakukan secara online maupun offline dengan mengikuti alur yang telah ditentukan.
        </p>
      </div>

      {/* Syarat dan Alur */}
      <div className="flex flex-col md:flex-row gap-6 w-11/12 md:w-3/4 mx-auto mb-8">
        <div className="bg-white w-full p-6 shadow-lg border border-gray-200 rounded-2xl">
          <h4 className='text-xl font-semibold text-red-700 mb-2'>Syarat Pendaftaran</h4>
          <ul className='text-gray-600 list-disc list-inside space-y-1'>
            <li>Usia minimal 6 tahun per 1 Juli 2025</li>
            <li>Fotokopi Akta Kelahiran</li>
            <li>Fotokopi Kartu Keluarga (KK)</li>
            <li>Pas Foto ukuran 3x4 sebanyak 2 lembar</li>
          </ul>
        </div>

        <div className="bg-white w-full p-6 shadow-lg border border-gray-200 rounded-2xl">
          <h4 className='text-xl font-semibold text-red-700 mb-2'>Alur Pendaftaran</h4>
          <ol className='text-gray-600 list-decimal list-inside space-y-1'>
            <li>Mengisi formulir pendaftaran secara online/offline</li>
            <li>Melampirkan berkas persyaratan</li>
            <li>Verifikasi berkas oleh panitia PPDB</li>
            <li>Pengumuman hasil seleksi</li>
            <li>Daftar ulang bagi peserta yang diterima</li>
          </ol>
        </div>
      </div>

      {/* Jadwal PPDB */}
      <div className="w-full text-center mb-4">
        <h4 className='text-2xl font-semibold text-red-700'>Jadwal PPDB</h4>
      </div>

      <div className="flex flex-col md:flex-row gap-6 w-11/12 md:w-3/4 mx-auto mb-10">
        <div className="bg-gray-50 w-full p-6 shadow-md border border-gray-200 rounded-2xl">
          <p className='text-gray-600'><span className='font-semibold'>Pendaftaran Dibuka:</span> 1 Juni 2025</p>
          <p className='text-gray-600'><span className='font-semibold'>Pendaftaran Ditutup:</span> 30 Juni 2025</p>
        </div>
        <div className="bg-gray-50 w-full p-6 shadow-md border border-gray-200 rounded-2xl">
          <p className='text-gray-600'><span className='font-semibold'>Pengumuman:</span> 5 Juli 2025</p>
          <p className='text-gray-600'><span className='font-semibold'>Daftar Ulang:</span> 6-10 Juli 2025</p>
        </div>
      </div>

      {/* Button Daftar */}
      <div className="text-center mb-10">
        <a 
          href="https://ppid.semarangkota.go.id/ppdb-kota-semarang-tahun-ajara-2024/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-md transition"
        >
          Daftar Sekarang
        </a>
        <div className="w-full h-10"></div>
      </div>
    </div>
  )
}

export default page
