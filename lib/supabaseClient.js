// lib/supabaseClient.js
// Ini adalah Supabase client untuk digunakan di Client Components ('use client')
// Jangan gunakan Service Role Key di sini!

import { createBrowserClient } from '@supabase/ssr'; // Menggunakan @supabase/ssr untuk client-side
// Atau, jika Anda masih menggunakan @supabase/supabase-js versi lama yang tidak ada createBrowserClient:
// import { createClient } from '@supabase/supabase-js';

// Fungsi untuk membuat dan mengembalikan instance Supabase client
export function createClient() {
  // Pastikan variabel lingkungan publik dimuat.
  // Mereka harus diawali dengan NEXT_PUBLIC_
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL atau Anon Key tidak ditemukan di environment variables.');
    throw new Error('Supabase URL and Anon Key must be defined as NEXT_PUBLIC_ variables.');
  }

  // Menggunakan createBrowserClient dari @supabase/ssr
  // Ini menangani cookies dan sesi user secara otomatis di browser.
  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  );

  // Jika Anda menggunakan @supabase/supabase-js versi lama tanpa @supabase/ssr:
  // return createClient(
  //   supabaseUrl,
  //   supabaseAnonKey
  // );
}

// Opsional: Langsung mengekspor instance client yang sudah jadi
// Jika Anda selalu ingin menggunakan instance yang sama di seluruh aplikasi
// export const supabase = createClient();