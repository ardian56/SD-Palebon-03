// middleware.js (Tempatkan di root proyek Next.js Anda)

import { NextResponse } from 'next/server';
// Hapus 'type' dari import: import type { NextRequest } from 'next/server';
// Cukup import NextRequest sebagai value biasa jika diperlukan, atau tidak perlu diimport jika tidak digunakan.
// Untuk middleware, NextRequest akan otomatis tersedia sebagai argumen.

import { createServerSupabaseClient } from './lib/supabaseServer';

export async function middleware(request) { // Hapus ': NextRequest'
  const { pathname } = request.nextUrl;
  
  // Inisialisasi Supabase client server-side untuk membaca sesi
  const supabase = createServerSupabaseClient();

  // Ambil sesi user saat ini dari Supabase Auth
  const { data: { user } } = await supabase.auth.getUser();

  // Log untuk debugging:
  console.log('Middleware: Request received for path:', pathname);
  if (user) {
    console.log('Middleware: User logged in, ID:', user.id, 'Email:', user.email);
  } else {
    console.log('Middleware: No user logged in.');
  }

  // Ambil user dari tabel public.users untuk mendapatkan role
  let userRole = null;
  if (user) {
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (userError && userError.code !== 'PGRST116') { // PGRST116 adalah 'No rows found'
        console.error('Middleware: Error fetching user role from DB:', userError.message);
        return NextResponse.redirect(new URL('/auth/signin', request.url));
      }
      userRole = userData?.role;
      console.log('Middleware: User role from DB:', userRole);

    } catch (dbError) {
      console.error('Middleware: Unexpected error getting user role from DB:', dbError.message);
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
  }

  // --- Logika Proteksi Admin ---
  const isAdminRoute = pathname.startsWith('/admin') ||
                       pathname.startsWith('/admin/guru') ||
                       pathname.startsWith('/admin/siswa') ||
                       pathname.startsWith('/admin/berita') ||
                       pathname.startsWith('/admin/warta') ||
                       pathname.startsWith('/admin/galeri') ||
                       pathname.startsWith('/admin/lomba') ||
                       pathname.startsWith('/admin/ekstra');   

  if (isAdminRoute) {
    console.log('Middleware: Accessing Admin Route:', pathname);
    if (!user) {
      console.log('Middleware: User not logged in, redirecting to /auth/signin');
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
    if (userRole !== 'admin') {
      console.warn(`Middleware: User ${user.email} (role: ${userRole}) attempted to access admin route. Redirecting to /unauthorized`);
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // --- Logika Proteksi Halaman Autentikasi ---
  const isAuthPage = pathname.startsWith('/auth/signin') || pathname.startsWith('/auth/signup');
  if (isAuthPage && user) {
    console.log('Middleware: User already logged in, redirecting from auth page.');
    if (userRole === 'admin') return NextResponse.redirect(new URL('/admin', request.url));
    if (userRole === 'guru') return NextResponse.redirect(new URL('/guru/dashboard', request.url));
    if (userRole === 'siswa') return NextResponse.redirect(new URL('/siswa/dashboard', request.url));
    return NextResponse.redirect(new URL('/', request.url));
  }

  console.log('Middleware: Request allowed to continue.');
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',          
    '/auth/signin',           
    '/auth/signup',           
  ],
};