// app/guru/dashboard/page.jsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabaseClient'; // Path disesuaikan

export default function GuruDashboard() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null); // Akan berisi name, role, photo_url, dan classes(name)
  const [message, setMessage] = useState('');

  // Function to fetch teacher's data and associated classes
  const fetchData = async () => {
    setLoading(true);
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    // If no session or session error, redirect to sign-in page
    if (!session || sessionError) {
      router.push('/auth/signin');
      return;
    }

    setUser(session.user); // Set the authenticated user

    // Fetch user profile data, including their assigned class name via join
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('name, role, photo_url, classes(name, id)') // Select class name and ID from joined table
      .eq('id', session.user.id)
      .single();

    // Check for profile errors or if the user is not a 'guru' or 'super_admin'
    if (profileError || (!['guru', 'super_admin'].includes(profile?.role))) {
      setMessage('Akses ditolak: Hanya guru atau super admin yang dapat melihat dashboard ini.');
      await supabase.auth.signOut(); // Sign out unauthorized users
      router.push('/'); // Redirect to home or login
      return;
    }
    setUserData(profile); // Set the teacher's profile data
    setLoading(false); // End loading state
  };

  useEffect(() => {
    fetchData(); // Fetch data on component mount

    // --- Real-time Subscriptions (Optional but good practice) ---
    // Listen for changes to the teacher's profile (e.g., if their role or class assignment changes)
    const profileSubscription = supabase
      .channel('user_profile_guru_dashboard_changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'users', filter: `id=eq.${user?.id}` },
        payload => {
            // Re-fetch data if the teacher's profile is updated
            console.log('Teacher profile change received!', payload);
            fetchData();
        }
      )
      .subscribe();

    // Cleanup subscriptions on component unmount
    return () => {
      profileSubscription.unsubscribe();
    };

  }, [router, supabase, user?.id]); // Dependencies: router, supabase instance, and user.id for filter

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-blue-600 text-lg">Memuat Dashboard Guru...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl font-sans">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Dashboard Guru</h1>

      {/* Message Display Area */}
      {message && (
        <p className={`mb-4 p-3 rounded ${message.includes('Akses ditolak') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </p>
      )}

      {/* Teacher Profile Card */}
      {userData && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 flex flex-col items-center md:flex-row md:items-start md:space-x-6">
          {userData.photo_url ? (
            <img
              src={userData.photo_url}
              alt="Foto Profil Guru"
              className="w-32 h-32 rounded-full object-cover border-4 border-blue-200 mb-4 md:mb-0"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-6xl mb-4 md:mb-0">
              {userData.name ? userData.name[0].toUpperCase() : '?'}
            </div>
          )}
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-semibold text-gray-700">{userData.name}</h2>
            <p className="text-gray-600 mt-1">Role: <span className="font-medium capitalize">{userData.role}</span></p>
            {/* Display the class name(s) the teacher is associated with */}
            {userData.classes?.name && <p className="text-gray-600">Mengajar Kelas: <span className="font-medium">{userData.classes.name}</span></p>}
            {user.email && <p className="text-gray-600">Email: <span className="font-medium">{user.email}</span></p>}
          </div>
        </div>
      )}

      {/* Action Buttons for Teachers */}
      <div className="bg-white p-6 rounded-lg shadow-md grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Button to manage attendance */}
        <Link href={`/guru/absen?classId=${userData?.classes?.id || ''}`} className="block">
          <button className="w-full bg-green-600 text-white p-4 rounded-lg shadow-md hover:bg-green-700 transition-colors text-lg font-semibold flex items-center justify-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <span>Kelola Absensi</span>
          </button>
        </Link>

        {/* Conditional button for viewing extracurriculars for regular guru */}
        {userData?.role === 'guru' && (
            <Link href={`/guru/ekstra/lihat?classId=${userData?.classes?.id || ''}`} className="block">
                <button className="w-full bg-indigo-600 text-white p-4 rounded-lg shadow-md hover:bg-indigo-700 transition-colors text-lg font-semibold flex items-center justify-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>Ekstrakurikuler</span>
                </button>
            </Link>
        )}
        {/* Button to add new class materials */}
        <Link href={`/guru/tugas?classId=${userData?.classes?.id || ''}`} className="block">
          <button className="w-full bg-purple-600 text-white p-4 rounded-lg shadow-md hover:bg-purple-700 transition-colors text-lg font-semibold flex items-center justify-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Materi Kelas</span>
          </button>
        </Link>
      </div>
    </div>
  );
}
