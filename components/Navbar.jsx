"use client";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfilOpen, setIsProfilOpen] = useState(false);
  const [isPengumumanOpen, setIsPengumumanOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const DownArrowIcon = ({ isOpen = false }) => (

    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`w-4 h-4 ml-1 transform transition-transform duration-300 ${
        isOpen ? "rotate-180" : "rotate-0"
      }`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );

  return (
    <div>
      <nav className="block w-full max-w-screen px-4 py-4 mx-auto bg-white bg-opacity-90 sticky top-3 shadow lg:px-8 backdrop-blur-lg backdrop-saturate-150 z-[9999]">
        <div className="container flex flex-wrap items-center justify-between mx-auto text-slate-800">
          <Link
            href="/"
            className="mr-4 block cursor-pointer py-1.5 text-red-600 font-bold text-2xl"
          >
            SDN PALEBON 03
          </Link>

          {/* Mobile toggle */}
          <div className="lg:hidden">
            <button onClick={toggleMobileMenu}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          <div
            className={`fixed top-0 left-0 min-h-screen w-64 bg-slate-100 shadow-lg transform transition-transform duration-300 ease-in-out ${
              isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            } lg:hidden z-50`}
          >
            <div className="flex items-center justify-between border-b px-4 py-4">
              <Link href="/" className="text-red-600 font-bold text-xl">
                SDN PALEBON 03
              </Link>
              <button onClick={toggleMobileMenu}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ul className="flex flex-col gap-2 p-4 text-slate-600">
              <li><Link href="/">Beranda</Link></li>

              <li>
                <button onClick={() => setIsProfilOpen(!isProfilOpen)} className="flex items-center hover:text-red-500">
                  Profil <DownArrowIcon isOpen={isProfilOpen} />
                </button>
                {isProfilOpen && (
                  <ul className="pl-4 mt-1 space-y-1">
                    <li><Link href="/profil" className="hover:text-red-500">Profil Sekolah</Link></li>
                    <li><Link href="/profil/guru" className="hover:text-red-500">Profil Guru</Link></li>
                    <li><Link href="/profil/siswa" className="hover:text-red-500">Profil Siswa</Link></li>
                  </ul>
                )}
              </li>

              <li><Link href="/galeri" className="hover:text-red-500">Galeri</Link></li>

              <li>
                <button onClick={() => setIsPengumumanOpen(!isPengumumanOpen)} className="flex items-center hover:text-red-500">
                  Pengumuman <DownArrowIcon isOpen={isPengumumanOpen} />
                </button>
                {isPengumumanOpen && (
                  <ul className="pl-4 mt-1 space-y-1">
                    <li><Link href="/pengumuman/warta" className="hover:text-red-500">Warta SD</Link></li>
                    <li><Link href="/pengumuman/berita" className="hover:text-red-500">Berita SD</Link></li>
                  </ul>
                )}
              </li>

              <li><Link href="/lomba" className="hover:text-red-500">Lomba Siswa</Link></li>
              <li><Link href="/ppdb" className="hover:text-red-500">PPDB</Link></li>
              <li><Link href="/kontak" className="hover:text-red-500">Kontak</Link></li>
            </ul>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:block">
            <ul className="flex items-center gap-6 text-lg text-slate-600">
              <li><Link href="/" className="hover:text-red-500">Beranda</Link></li>

              <li className="relative group">
                <button className="hover:text-red-500 flex items-center">
                  Profil
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 ml-1 transform transition-transform duration-300 group-hover:rotate-180"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <ul className="absolute left-0 top-[110%] bg-white shadow-md rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10 w-48">
                  <li><Link href="/profil" className="block px-4 py-2 hover:text-red-800">Profil Sekolah</Link></li>
                  <li><Link href="/profil/guru" className="block px-4 py-2 hover:text-red-800">Profil Guru</Link></li>
                  <li><Link href="/profil/siswa" className="block px-4 py-2 hover:text-red-800">Profil Siswa</Link></li>
                </ul>
              </li>

              <li><Link href="/galeri" className="hover:text-red-500">Galeri</Link></li>

              <li className="relative group">
                <button className="hover:text-red-500 flex items-center">
                  Pengumuman
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 ml-1 transform transition-transform duration-300 group-hover:rotate-180"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <ul className="absolute left-0 top-[110%] bg-white shadow-md rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10 w-48">
                  <li><Link href="/pengumuman/warta" className="block px-4 py-2 hover:text-red-800">Warta SD</Link></li>
                  <li><Link href="/pengumuman/berita" className="block px-4 py-2 hover:text-red-800">Berita SD</Link></li>
                </ul>
              </li>

              <li><Link href="/lomba" className="hover:text-red-500">Lomba Siswa</Link></li>
              <li><Link href="/ppdb" className="hover:text-red-500">PPDB</Link></li>
              <li><Link href="/kontak" className="hover:text-red-500">Kontak</Link></li>
              <li><Link href="/pengaduan" className="hover:text-red-500">Pengaduan</Link></li>
              <li><Link href="/Tentang" className="hover:text-red-500">Tentang</Link></li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
}
