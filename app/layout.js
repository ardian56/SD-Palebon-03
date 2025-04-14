// File: layout.jsx
'use client';

import { usePathname } from 'next/navigation';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './globals.css';

// Import metadata dari file server-side
import { metadata } from './metadata';

export default function RootLayout({ children }) {
  const pathname = usePathname();

  // Daftar halaman yang tidak butuh Navbar & Footer
  const hiddenRoutes = ['/login', '/admin'];

  // Memeriksa apakah halaman yang sedang diakses membutuhkan layout (Navbar & Footer)
  const hideLayout = hiddenRoutes.some((path) => pathname.startsWith(path));

  return (
    <html lang="id">
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
      </head>
      <body>
        {!hideLayout && <Navbar />}
        {children}
        {!hideLayout && <Footer />}
      </body>
    </html>
  );
}
