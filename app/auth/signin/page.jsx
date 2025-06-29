// app/auth/signin/page.jsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../lib/supabaseClient';
import { GraduationCap, Users } from 'lucide-react';

export default function GuruSiswaLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setErrorMsg(authError.message);
      setLoading(false);
      return;
    }

    const userId = authData.user?.id;

    if (!userId) {
      setErrorMsg('Login berhasil, namun ID user tidak ditemukan.');
      setLoading(false);
      return;
    }

    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (userError) {
        if (userError.code === 'PGRST116') {
          setErrorMsg('Profil user tidak ditemukan. Silakan hubungi admin.');
        } else {
          setErrorMsg(`Gagal mengambil data user: ${userError.message}`);
        }
        setLoading(false);
        return;
      }

      const userRole = userData?.role;

      if (!userRole) {
        setErrorMsg('Role user tidak ditemukan. Silakan hubungi admin.');
        setLoading(false);
        return;
      }

      switch (userRole) {
        case 'guru':
          router.push('/guru/dashboard');
          break;
        case 'siswa':
          router.push('/siswa/dashboard');
          break;
        case 'admin':
          setErrorMsg('Akses ditolak: Admin harus login melalui halaman admin.');
          await supabase.auth.signOut();
          setLoading(false);
          return;
        default:
          setErrorMsg('Role user tidak dikenal. Silakan hubungi admin.');
          await supabase.auth.signOut();
          setLoading(false);
          return;
      }
    } catch (dbFetchError) {
      console.error('Error fetching user role from database:', dbFetchError.message);
      setErrorMsg(`Terjadi kesalahan saat verifikasi role: ${dbFetchError.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-red-50 px-4">
      <div className="bg-white border border-gray-200 shadow-2xl rounded-3xl px-8 py-10 w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="flex justify-center items-center gap-3 mb-4">
            <div className="bg-red-600 p-3 rounded-full">
              <GraduationCap size={32} className="text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">SDN PALEBON 03</h2>
          <p className="text-sm text-gray-600">Portal Guru & Siswa</p>
        </div>

        {errorMsg && (
          <div className="text-sm text-red-600 text-center bg-red-50 border border-red-200 rounded-lg p-3">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 text-gray-800 border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition duration-200"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 text-gray-800 border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition duration-200"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition duration-200 shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Memuat...
              </div>
            ) : (
              'Masuk'
            )}
          </button>
        </form>

        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <Users size={16} />
            <span>Untuk Guru dan Siswa</span>
          </div>
        </div>
      </div>
    </div>
  );
}