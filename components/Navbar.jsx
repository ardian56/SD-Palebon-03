"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfilOpen, setIsProfilOpen] = useState(false);
  const [isPengumumanOpen, setIsPengumumanOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const DownArrowIcon = ({ isOpen = false }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`w-4 h-4 ml-1 transition-transform duration-300 ${
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

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const closeMenu = () => {
    setIsMobileMenuOpen(false);
    setIsProfilOpen(false);
    setIsPengumumanOpen(false);
  };

  return (
    <header className="w-full bg-white shadow sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-4 lg:px-8">
        <Link href="/" className="text-2xl font-bold text-red-600">
          SDN PALEBON 03
        </Link>

        {/* Mobile toggle */}
        <div className="lg:hidden">
          <button
            onClick={toggleMobileMenu}
            className="relative w-8 h-8 flex items-center justify-center focus:outline-none group"
          >
            <span className={`absolute w-6 h-0.5 bg-gray-800 transition-all duration-300 ease-in-out
              ${isMobileMenuOpen ? "rotate-45 translate-y-1" : "-translate-y-2"}`}></span>
            <span className={`absolute w-6 h-0.5 bg-gray-800 transition-opacity duration-300
              ${isMobileMenuOpen ? "opacity-0" : "opacity-100"}`}></span>
            <span className={`absolute w-6 h-0.5 bg-gray-800 transition-all duration-300 ease-in-out
              ${isMobileMenuOpen ? "-rotate-45 -translate-y-1" : "translate-y-2"}`}></span>
          </button>
        </div>

        {/* Desktop menu */}
        <ul className="hidden lg:flex space-x-6 text-slate-700 font-medium">
          <li><Link href="/" className="hover:text-red-600">Beranda</Link></li>

          <li className="relative group">
            <button className="flex items-center hover:text-red-600">
              Profil <DownArrowIcon />
            </button>
            <ul className="absolute left-0 mt-2 bg-white shadow-lg rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 w-44">
              <li><Link href="/profil" className="block px-4 py-2 hover:text-red-600">Profil Sekolah</Link></li>
              <li><Link href="/guru" className="block px-4 py-2 hover:text-red-600">Profil Guru</Link></li>
              <li><Link href="/siswa" className="block px-4 py-2 hover:text-red-600">Profil Siswa</Link></li>
            </ul>
          </li>

          <li><Link href="/galeri" className="hover:text-red-600">Galeri</Link></li>

          <li className="relative group">
            <button className="flex items-center hover:text-red-600">
              Pengumuman <DownArrowIcon />
            </button>
            <ul className="absolute left-0 mt-2 bg-white shadow-lg rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 w-44">
              <li><Link href="/warta" className="block px-4 py-2 hover:text-red-600">Warta SD</Link></li>
              <li><Link href="/berita" className="block px-4 py-2 hover:text-red-600">Berita SD</Link></li>
            </ul>
          </li>

          <li><Link href="/lomba" className="hover:text-red-600">Lomba Siswa</Link></li>
          <li><Link href="/ppdb" className="hover:text-red-600">PPDB</Link></li>
          <li><Link href="/kontak" className="hover:text-red-600">Kontak</Link></li>
          <li><Link href="/pengaduan" className="hover:text-red-600">Pengaduan</Link></li>
        </ul>
      </div>

      {/* Mobile dropdown menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-red-50 px-4 py-4 border-t border-slate-200 shadow-md">
          <ul className="space-y-2 text-slate-700 font-medium">
            <li>
              <Link
                href="/"
                onClick={closeMenu}
                className="block px-2 py-2 rounded-md hover:bg-red-100 hover:text-red-700 transition-colors duration-200"
              >
                Beranda
              </Link>
            </li>

            <li>
              <button
                onClick={() => setIsProfilOpen(!isProfilOpen)}
                className="flex items-center w-full px-2 py-2 rounded-md hover:bg-red-100 hover:text-red-700 transition-colors duration-200"
              >
                Profil <DownArrowIcon isOpen={isProfilOpen} />
              </button>
              {isProfilOpen && (
                <ul className="ml-4 mt-2 space-y-1 text-sm">
                  <li><Link href="/profil" onClick={closeMenu} className="block px-2 py-1 rounded hover:bg-red-100 hover:text-red-700 transition">Profil Sekolah</Link></li>
                  <li><Link href="/guru" onClick={closeMenu} className="block px-2 py-1 rounded hover:bg-red-100 hover:text-red-700 transition">Profil Guru</Link></li>
                  <li><Link href="/siswa" onClick={closeMenu} className="block px-2 py-1 rounded hover:bg-red-100 hover:text-red-700 transition">Profil Siswa</Link></li>
                </ul>
              )}
            </li>

            <li><Link href="/galeri" onClick={closeMenu} className="block px-2 py-2 rounded-md hover:bg-red-100 hover:text-red-700 transition">Galeri</Link></li>

            <li>
              <button
                onClick={() => setIsPengumumanOpen(!isPengumumanOpen)}
                className="flex items-center w-full px-2 py-2 rounded-md hover:bg-red-100 hover:text-red-700 transition"
              >
                Pengumuman <DownArrowIcon isOpen={isPengumumanOpen} />
              </button>
              {isPengumumanOpen && (
                <ul className="ml-4 mt-2 space-y-1 text-sm">
                  <li><Link href="/warta" onClick={closeMenu} className="block px-2 py-1 rounded hover:bg-red-100 hover:text-red-700 transition">Warta SD</Link></li>
                  <li><Link href="/berita" onClick={closeMenu} className="block px-2 py-1 rounded hover:bg-red-100 hover:text-red-700 transition">Berita SD</Link></li>
                </ul>
              )}
            </li>

            <li><Link href="/lomba" onClick={closeMenu} className="block px-2 py-2 rounded-md hover:bg-red-100 hover:text-red-700 transition">Lomba Siswa</Link></li>
            <li><Link href="/ppdb" onClick={closeMenu} className="block px-2 py-2 rounded-md hover:bg-red-100 hover:text-red-700 transition">PPDB</Link></li>
            <li><Link href="/kontak" onClick={closeMenu} className="block px-2 py-2 rounded-md hover:bg-red-100 hover:text-red-700 transition">Kontak</Link></li>
            <li><Link href="/pengaduan" onClick={closeMenu} className="block px-2 py-2 rounded-md hover:bg-red-100 hover:text-red-700 transition">Pengaduan</Link></li>
          </ul>
        </div>
      )}
    </header>
  );
}
