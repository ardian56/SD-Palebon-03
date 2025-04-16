import React from 'react'

const page = () => {
  return (
    <div className='bg-white/90 backdrop:backdrop-blur-md min-h-screen w-full '>
        <div className="header sm:w-1/3 mx-auto pt-20 mb-10">
            <h3 className='text-2xl font-bold text-gray-900 text-center'>PPDB SDN Palebon 03</h3>
            <h3 className='text-2xl font-bold text-red-600 text-center'>Tahun Ajaran 2025/2026</h3>
        </div>
        <div className="card bg-white w-4/5 mx-auto p-4 shadow-md border-1 border-gray-300 rounded-xl">
          <h4 className='text-xl font-bold text-gray-700'>Informasi Umum</h4>
          <p className='text-gray-500'>SDN Palebon 03 membuka pendaftaran peserta didik baru tahun ajaran 2025/2026. Pendaftaran dilakukan secara online maupun offline dengan mengikuti alur yang telah ditentukan.</p>
        </div>
        <div className="w-full  flex flex-col sm:flex-row mt-5 sm:px-35 pb-3">
          <div className="card w-4/5 bg-white mx-auto p-4 shadow-md border-1 border-gray-300 rounded-xl mb-2 sm:mx-4">
            <h4 className='text-xl font-bold text-gray-700'>Syarat Pendaftaran</h4>
            <p className='text-gray-500'>- Usai minimal 6 Tahun per 1 juli 2025</p>
            <p className='text-gray-500'>- Fotokopi Akta Kelahiran</p>
            <p className='text-gray-500'>- Fotokopi Kartu Keluarga (KK).</p>
            <p className='text-gray-500'>- Pas Foto bersama 3x4 sebanyak 2 lembar</p>
          </div>
          <div className="card bg-white w-4/5 mx-auto p-4 shadow-md border-1 border-gray-300 rounded-xl mb-2 sm:mx-4">
            <h4 className='text-xl font-bold text-gray-700'>Alur pendidikan</h4>
            <p className='text-gray-500'>1. Mengisi formulir pendaftaran secara online/offline</p>
            <p className='text-gray-500'>2. Melampirkan berkas persyaratan</p>
            <p className='text-gray-500'>3. Verifikasi berkas oleh panitia PPDB</p>
            <p className='text-gray-500'>4. Pengumuman hasil seleksi</p>
            <p className='text-gray-500'>5. Daftar ulang bagi peserta yang diterima</p>
          </div>
        </div>
        <div className="sm:px-39 mb-2">
          <h4 className='text-xl font-bold text-gray-700 text-center sm:text-left'>Jadwal PPDB</h4>
        </div>
        <div className="w-full  flex flex-col sm:flex-row sm:px-35 pb-3">

          <div className="card w-4/5 bg-gray-50 mx-auto p-4 shadow-md  rounded mb-2 sm:mx-4">
            <p className='text-gray-500'><span className='font-bold'>Pendaftaran Dibuka: </span>1 Juni 2025</p>
            <p className='text-gray-500'><span className='font-bold'>Pendaftaran Ditutup: </span>30 Juni 2025</p>
          </div>
          <div className="card bg-gray-50 w-4/5 mx-auto p-4 shadow-md rounded mb-2 sm:mx-4">
            <p className='text-gray-500'><span className='font-bold'>Pengumuman: </span>5 Juli 2025</p>
            <p className='text-gray-500'><span className='font-bold'>Daftar ulang: </span>6-10 Juli 2025</p>
          </div>
        </div>
        
        <a 
          href="https://ppid.semarangkota.go.id/ppdb-kota-semarang-tahun-ajara-2024/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-2 bg-red-400 text-sm rounded mx-auto flex w-max text-white"
        >
          Daftar Sekarang
        </a>
      <div className="w-full h-10 bg-white/90 backdrop-blur-md"></div>
    </div>
  )
}

export default page