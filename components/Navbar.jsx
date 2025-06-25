// components/Navbar.jsx
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { createClient } from '../lib/supabaseClient';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfilOpen, setIsProfilOpen] = useState(false); // Untuk dropdown Profil umum & dropdown user mobile
  const [isPengumumanOpen, setIsPengumumanOpen] = useState(false);

  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function getUserSession() {
      setLoadingUser(true);
      const { data: { session }, error } = await supabase.auth.getSession();

      if (session) {
        setUser(session.user);
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('name, role, photo_url, class, position')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('Error fetching user profile:', profileError.message);
        } else {
          setUserData(profile);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoadingUser(false);
    }

    getUserSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        supabase
          .from('users')
          .select('name, role, photo_url, class, position')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile, error: profileError }) => {
            if (profileError) {
              console.error('Error fetching user profile on state change:', profileError.message);
            } else {
              setUserData(profile);
            }
          });
      } else {
        setUser(null);
        setUserData(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/'); // Kembali ke beranda setelah logout
  };

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

  const displayName = userData?.name || user?.email;
  const displayRole = userData?.role ? `(${userData.role})` : '';
  const displayClassPosition = userData?.role === 'siswa' && userData?.class
    ? `Kelas: ${userData.class}`
    : userData?.role === 'guru' && userData?.position
    ? `Jabatan: ${userData.position}`
    : '';


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

          {/* Mobile toggle and menu remain the same */}
          <div className="lg:hidden">
            <button
              onClick={toggleMobileMenu}
              className="relative w-8 h-8 focus:outline-none flex flex-col justify-center items-center"
            >
              <span
                className={`block w-8 h-0.5 bg-slate-800 transform transition duration-300 ease-in-out ${
                  isMobileMenuOpen ? "rotate-45 translate-y-1.5" : ""
                }`}
              />
              <span
                className={`block w-8 h-0.5 bg-slate-800 my-1 transition-all duration-300 ease-in-out ${
                  isMobileMenuOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`block w-8 h-0.5 bg-slate-800 transform transition duration-300 ease-in-out ${
                  isMobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
                }`}
              />
            </button>
          </div>

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
                    <li><Link href="/guru" className="hover:text-red-500">Profil Guru</Link></li>
                    <li><Link href="/siswa" className="hover:text-red-500">Profil Siswa</Link></li>
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
                    <li><Link href="/warta" className="hover:text-red-500">Warta SD</Link></li>
                    <li><Link href="/berita" className="hover:text-red-500">Berita SD</Link></li>
                  </ul>
                )}
              </li>
              <li><Link href="/lomba" className="hover:text-red-500">Lomba Siswa</Link></li>
              <li><Link href="/ppdb" className="hover:text-red-500">PPDB</Link></li>
              <li><Link href="/kontak" className="hover:text-red-500">Kontak</Link></li>

              {/* Login/Logout and Dashboard link for Mobile Menu */}
              <li className="mt-4">
                {loadingUser ? (
                  <div className="text-gray-500">Loading user...</div>
                ) : user ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsProfilOpen(!isProfilOpen)} // Reuse isProfilOpen for mobile user dropdown toggle
                      className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-red-500 transition duration-300 rounded-md focus:outline-none w-full text-left"
                    >
                      {userData?.photo_url && (
                        <img
                          src={userData.photo_url}
                          alt="Profil"
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      )}
                      <span>Halo, {displayName}</span>
                      <DownArrowIcon isOpen={isProfilOpen} />
                    </button>
                    {isProfilOpen && (
                      <div className="bg-white shadow-lg rounded-md py-1 z-20 w-full">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-semibold">{displayName} {displayRole}</p>
                          {displayClassPosition && <p className="text-xs text-gray-500">{displayClassPosition}</p>}
                        </div>
                        {user && userData?.role !== 'admin' && ( // Link Dashboard untuk siswa/guru
                          <Link
                            href={userData?.role === 'siswa' ? `/siswa/dashboard` : userData?.role === 'guru' ? `/guru/dashboard` : `/dashboard/${user.id}`}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Dashboard
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href="/auth/signin"
                    className="px-4 py-2 text-red-600 border border-red-600 rounded-md hover:bg-red-600 hover:text-white transition duration-300 w-full block text-center"
                  >
                    Login
                  </Link>
                )}
              </li>
            </ul>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-6 text-lg text-slate-600">
            <ul className="flex items-center gap-6">
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
                <ul className="absolute left-0 top-[110%] bg-white shadow-md rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10 w-48 py-2">
                  <li><Link href="/profil" className="block px-4 py-2 hover:text-red-800">Profil Sekolah</Link></li>
                  <li><Link href="/guru" className="block px-4 py-2 hover:text-red-800">Profil Guru</Link></li>
                  <li><Link href="/siswa" className="block px-4 py-2 hover:text-red-800">Profil Siswa</Link></li>
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
                <ul className="absolute left-0 top-[110%] bg-white shadow-md rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10 w-48 py-2">
                  <li><Link href="/warta" className="block px-4 py-2 hover:text-red-800">Warta SD</Link></li>
                  <li><Link href="/berita" className="block px-4 py-2 hover:text-red-800">Berita SD</Link></li>
                </ul>
              </li>
              <li><Link href="/lomba" className="hover:text-red-500">Lomba Siswa</Link></li>
              <li><Link href="/ppdb" className="hover:text-red-500">PPDB</Link></li>
              <li><Link href="/kontak" className="hover:text-red-500">Kontak</Link></li>
            </ul>

            {/* Login/Logout and Dashboard link for Desktop Menu */}
            <div className="ml-6">
              {loadingUser ? (
                <div className="text-gray-500">Loading user...</div>
              ) : user ? (
                <div className="relative group">
                  <button
                    className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-red-500 transition duration-300 rounded-md focus:outline-none"
                  >
                    {userData?.photo_url && (
                      <img
                        src={userData.photo_url}
                        alt="Profil"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    )}
                    <span>Halo, {displayName}</span>
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

                  <ul className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-20">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-semibold">{displayName} {displayRole}</p>
                      {displayClassPosition && <p className="text-xs text-gray-500">{displayClassPosition}</p>}
                    </div>
                    {user && userData?.role !== 'admin' && ( // Link Dashboard untuk siswa/guru
                      <Link
                        href={userData?.role === 'siswa' ? `/siswa/dashboard` : userData?.role === 'guru' ? `/guru/dashboard` : `/dashboard/${user.id}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </ul>
                </div>
              ) : (
                <Link
                  href="/auth/signin"
                  className="px-4 py-2 text-red-600 border border-red-600 rounded-md hover:bg-red-600 hover:text-white transition duration-300"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}