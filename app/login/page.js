'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { BookOpen } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setErrorMsg(error.message);
    } else {
      router.push('/admin');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0e0e0e] px-4">
      <div className="bg-gradient-to-br from-[#1a1a1a] via-[#1f1f1f] to-[#111] border border-gray-700 shadow-2xl rounded-2xl px-8 py-10 w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="flex justify-center items-center gap-2 mb-2">
            <BookOpen size={32} className="text-orange-400" />
            <h2 className="text-3xl font-bold text-white">Admin Panel</h2>
          </div>
          <p className="text-sm text-gray-400">Silakan login untuk melanjutkan</p>
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
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition duration-200 shadow-md"
          >
            Masuk
          </button>
        </form>

      </div>
    </div>
  );
}
