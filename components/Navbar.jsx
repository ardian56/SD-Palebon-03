'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isProfilOpen, setIsProfilOpen] = useState(false)
  const [isPengumumanOpen, setIsPengumumanOpen] = useState(false)

  return (
    <nav className="bg-blue-500 fixed w-full top-0 z-50 shadow-xl">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <Image src="/assets/logo2.png" width={32} height={32} className="h-8 w-8 rounded-full" alt="Logo SD Palebon 03" />
          <span className="self-center text-2xl font-semibold whitespace-nowrap text-white">SD Palebon 03</span>
        </Link>

        <button
          type="button"
          className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-white rounded-lg md:hidden hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15" />
          </svg>
        </button>

        <div className={`${isOpen ? 'block' : 'hidden'} w-full md:flex md:w-auto`} id="navbar-menu">
          <ul className="flex flex-col md:flex-row font-medium p-4 md:p-0 mt-4 md:mt-0 border border-blue-400 rounded-lg bg-blue-500 md:border-0 md:bg-transparent md:space-x-6 rtl:space-x-reverse">
            <li>
              <Link href="/" className="block py-2 px-3 text-white hover:bg-blue-600 md:hover:bg-transparent md:hover:text-white md:p-0">
                Beranda
              </Link>
            </li>

            {/* PROFIL - Desktop Dropdown */}
            <li className="relative group hidden md:block">
              <button className="flex items-center px-3 text-white hover:text-white">
                Profil
                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <ul className="absolute left-0 top-[100%] z-10 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition bg-blue-500 text-white rounded-md shadow-lg min-w-[180px] whitespace-nowrap">
                <li><Link href="/profil" className="block px-4 py-2 hover:bg-blue-600">Profil Sekolah</Link></li>
                <li><Link href="/profil/guru" className="block px-4 py-2 hover:bg-blue-600">Profil Guru</Link></li>
                <li><Link href="/profil/siswa" className="block px-4 py-2 hover:bg-blue-600">Profil Siswa</Link></li>
              </ul>
            </li>

            {/* PROFIL - Mobile Dropdown */}
            <li className="md:hidden">
              <button
                className="flex justify-between w-full py-2 px-3 text-white hover:bg-blue-600"
                onClick={() => setIsProfilOpen(!isProfilOpen)}
              >
                Profil
                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isProfilOpen && (
                <ul className="pl-4">
                  <li><Link href="/profil" className="block py-2 px-3 text-white hover:bg-blue-600">Profil Sekolah</Link></li>
                  <li><Link href="/profil/guru" className="block py-2 px-3 text-white hover:bg-blue-600">Profil Guru</Link></li>
                  <li><Link href="/profil/siswa" className="block py-2 px-3 text-white hover:bg-blue-600">Profil Siswa</Link></li>
                </ul>
              )}
            </li>

            <li>
              <Link href="/galeri" className="block py-2 px-3 text-white hover:bg-blue-600 md:hover:bg-transparent md:p-0">
                Galeri
              </Link>
            </li>

            {/* PENGUMUMAN - Desktop Dropdown */}
            <li className="relative group hidden md:block">
              <button className="flex items-center px-3 text-white hover:text-white">
                Pengumuman
                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <ul className="absolute left-0 top-[100%] z-10 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition bg-blue-500 text-white rounded-md shadow-lg min-w-[180px] whitespace-nowrap">
                <li><Link href="/pengumuman/warta" className="block px-4 py-2 hover:bg-blue-600">Warta SD</Link></li>
                <li><Link href="/pengumuman/berita" className="block px-4 py-2 hover:bg-blue-600">Berita SD</Link></li>
              </ul>
            </li>

            {/* PENGUMUMAN - Mobile Dropdown */}
            <li className="md:hidden">
              <button
                className="flex justify-between w-full py-2 px-3 text-white hover:bg-blue-600"
                onClick={() => setIsPengumumanOpen(!isPengumumanOpen)}
              >
                Pengumuman
                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isPengumumanOpen && (
                <ul className="pl-4">
                  <li><Link href="/pengumuman/warta" className="block py-2 px-3 text-white hover:bg-blue-600">Warta SD</Link></li>
                  <li><Link href="/pengumuman/berita" className="block py-2 px-3 text-white hover:bg-blue-600">Berita SD</Link></li>
                </ul>
              )}
            </li>

            <li>
              <Link href="/lomba" className="block py-2 px-3 text-white hover:bg-blue-600 md:hover:bg-transparent md:p-0">
                Lomba Siswa
              </Link>
            </li>
            <li>
              <Link href="/ppdb" className="block py-2 px-3 text-white hover:bg-blue-600 md:hover:bg-transparent md:p-0">
                PPDB
              </Link>
            </li>
            <li>
              <Link href="/kontak" className="block py-2 px-3 text-white hover:bg-blue-600 md:hover:bg-transparent md:p-0">
                Kontak
              </Link>
            </li>
            <li>
              <Link href="/pengaduan" className="block py-2 px-3 text-white hover:bg-blue-600 md:hover:bg-transparent md:p-0">
                Pengaduan
              </Link>
            </li>
            <li>
              <Link href="/tentang" className="block py-2 px-3 text-white hover:bg-blue-600 md:hover:bg-transparent md:p-0">
                Tentang
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
