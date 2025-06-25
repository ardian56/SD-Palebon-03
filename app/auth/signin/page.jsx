// app/auth/signin/page.jsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../lib/supabaseClient'; // <--- SESUAIKAN PATH INI
import { UserCircle } from 'lucide-react'; // Gunakan UserCircle atau ikon generik lainnya

export default function UniversalLoginPage() {
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
        case 'admin':
          router.push('/admin');
          break;
        case 'guru':
          router.push('/guru/dashboard');
          break;
        case 'siswa':
          router.push('/siswa/dashboard');
          break;
        default:
          setErrorMsg('Role user tidak dikenal. Silakan hubungi admin.');
          router.push('/');
      }
    } catch (dbFetchError) {
      console.error('Error fetching user role from database:', dbFetchError.message);
      setErrorMsg(`Terjadi kesalahan saat verifikasi role: ${dbFetchError.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0e0e0e] px-4">
      <div className="bg-gradient-to-br from-[#1a1a1a] via-[#1f1f1f] to-[#111] border border-gray-700 shadow-2xl rounded-2xl px-8 py-10 w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="flex justify-center items-center gap-2 mb-2">
            <UserCircle size={32} className="text-orange-400" />
            <h2 className="text-3xl font-bold text-white">Login Aplikasi</h2>
          </div>
          <p className="text-sm text-gray-400">Masuk ke akun Anda</p>
        </div>

        {errorMsg && (
          <div className="text-sm text-red-500 text-center bg-red-900 bg-opacity-30 border border-red-700 rounded p-2">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2 rounded-lg bg-[#222] text-white border border-gray-600 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 rounded-lg bg-[#222] text-white border border-gray-600 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition duration-200 shadow-md"
            disabled={loading}
          >
            {loading ? 'Memuat...' : 'Masuk'}
          </button>
        </form>

      </div>
    </div>
  );
}