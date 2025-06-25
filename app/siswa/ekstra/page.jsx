// app/siswa/ekstra/page.jsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '../../../lib/supabaseClient';

export default function PilihEkstrakurikuler() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null); // Termasuk status finalisasi
  const [extracurriculars, setExtracurriculars] = useState([]);
  const [selectedExtracurriculars, setSelectedExtracurriculars] = useState([]);
  const [availableExtracurriculars, setAvailableExtracurriculars] = useState([]);

  const [message, setMessage] = useState('');

  const fetchData = async () => { // Fungsi ini dibuat terpisah agar bisa dipanggil ulang
    setLoading(true);
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (!session || sessionError) {
      router.push('/auth/signin');
      return;
    }

    setUser(session.user);

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('name, role, extracurricular_finalized') // Ambil status finalisasi
      .eq('id', session.user.id)
      .single();

    if (profileError || profile?.role !== 'siswa') {
      setMessage('Akses ditolak: Anda bukan siswa.');
      await supabase.auth.signOut();
      router.push('/');
      return;
    }
    setUserData(profile);

    const { data: allExtras, error: allExtrasError } = await supabase
      .from('extracurriculars')
      .select('*')
      .order('name', { ascending: true });

    if (allExtrasError) {
      setMessage('Error mengambil daftar ekstra: ' + allExtrasError.message);
      setLoading(false);
      return;
    }
    setExtracurriculars(allExtras);

    const { data: userExtras, error: userExtrasError } = await supabase
      .from('student_extracurriculars')
      .select('extracurricular_id, extracurriculars(name)')
      .eq('user_id', session.user.id);

    if (userExtrasError) {
      setMessage('Error mengambil ekstra yang dipilih: ' + userExtrasError.message);
      setLoading(false);
      return;
    }

    const currentSelectedIds = userExtras.map(ue => ue.extracurricular_id);
    setSelectedExtracurriculars(userExtras);

    const available = allExtras.filter(extra => !currentSelectedIds.includes(extra.id));
    setAvailableExtracurriculars(available);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();

    // Listener untuk perubahan data ekstrakurikuler siswa (real-time updates)
    const subscription = supabase
      .channel('student_extracurriculars_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'student_extracurriculars', filter: `user_id=eq.${user?.id}` },
        payload => {
            console.log('Change received!', payload);
            fetchData(); // Panggil ulang data jika ada perubahan (insert/delete)
        }
      )
      .subscribe();

    // Listener untuk perubahan status finalisasi pengguna (jika admin mengubahnya)
    const profileSubscription = supabase
      .channel('user_profile_finalized_changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'users', filter: `id=eq.${user?.id}` },
        payload => {
            if (payload.new.extracurricular_finalized !== payload.old.extracurricular_finalized) {
                console.log('Finalization status changed:', payload.new.extracurricular_finalized);
                setUserData(prev => ({ ...prev, extracurricular_finalized: payload.new.extracurricular_finalized }));
            }
        }
      )
      .subscribe();


    return () => {
      subscription.unsubscribe();
      profileSubscription.unsubscribe();
    };

  }, [router, supabase, user?.id]); // Pastikan user?.id ada sebelum digunakan di dependensi fetchData

  const isFinalized = userData?.extracurricular_finalized; // Dapatkan status finalisasi

  const handleSelectExtra = async (extracurricularId) => {
    if (isFinalized) { // Cegah jika sudah finalisasi
        setMessage('Pilihan Anda sudah difinalisasi, tidak bisa menambah ekstra.');
        return;
    }
    if (selectedExtracurriculars.length >= 2) {
      setMessage('Anda hanya dapat memilih maksimal 2 ekstrakurikuler.');
      return;
    }

    setLoading(true);
    setMessage('');
    const { error } = await supabase.from('student_extracurriculars').insert({
      user_id: user.id,
      extracurricular_id: extracurricularId,
    });

    if (error) {
      if (error.message.includes('maksimal 2 ekstrakurikuler')) {
         setMessage('Gagal: ' + error.message);
      } else {
         setMessage('Gagal memilih ekstra: ' + error.message);
      }
    } else {
      setMessage('Ekstrakurikuler berhasil ditambahkan!');
      fetchData(); // Panggil ulang untuk update UI
    }
    setLoading(false);
  };

  const handleRemoveExtra = async (extracurricularId) => {
    if (isFinalized) { // Cegah jika sudah finalisasi
        setMessage('Pilihan Anda sudah difinalisasi, tidak bisa menghapus ekstra.');
        return;
    }
    // Hapus hanya jika masih ada 2 ekstra dan yang akan dihapus bukan yang terakhir
    // Atau jika hanya ada 1 ekstra, masih bisa dihapus (misal mau ganti)
    if (selectedExtracurriculars.length === 2) {
        // Jika sedang memilih 2 dan mau hapus 1, masih bisa.
        // Kalau finalisasi sudah ON, baru tidak bisa hapus.
    }


    setLoading(true);
    setMessage('');
    const { error } = await supabase.from('student_extracurriculars')
      .delete()
      .eq('user_id', user.id)
      .eq('extracurricular_id', extracurricularId);

    if (error) {
      setMessage('Gagal menghapus ekstra: ' + error.message);
    } else {
      setMessage('Ekstrakurikuler berhasil dihapus!');
      fetchData(); // Panggil ulang untuk update UI
    }
    setLoading(false);
  };

  const handleFinalizeChoices = async () => {
    if (selectedExtracurriculars.length === 0) {
        setMessage('Anda harus memilih setidaknya satu ekstrakurikuler sebelum finalisasi.');
        return;
    }
    if (selectedExtracurriculars.length > 2) {
        setMessage('Terjadi kesalahan: Anda memiliki lebih dari 2 ekstrakurikuler yang dipilih. Silakan hubungi admin.');
        return;
    }

    setLoading(true);
    setMessage('');
    const { error } = await supabase
      .from('users')
      .update({ extracurricular_finalized: true })
      .eq('id', user.id);

    if (error) {
      setMessage('Gagal memfinalisasi pilihan: ' + error.message);
    } else {
      setMessage('Pilihan ekstrakurikuler Anda berhasil difinalisasi!');
      setUserData(prev => ({ ...prev, extracurricular_finalized: true })); // Update state lokal
    }
    setLoading(false);
  };


  if (loading) {
    return <div className="text-center p-8 text-gray-700">Memuat data ekstrakurikuler...</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl">
      <Link href="/siswa/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Kembali ke Dashboard
      </Link>

      <h1 className="text-3xl font-bold mb-6 text-gray-800">Pilih Ekstrakurikuler</h1>
      {userData && (
          <p className="text-gray-600 mb-4">Halo <span className="font-medium">{userData.name}</span>, silakan kelola pilihan ekstrakurikuler Anda.</p>
      )}

      {message && (
        <p className={`mb-4 p-3 rounded ${message.includes('Gagal') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </p>
      )}

      {isFinalized && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
              <p className="font-bold">Pilihan Anda Sudah Difinalisasi!</p>
              <p>Anda tidak dapat lagi mengubah pilihan ekstrakurikuler. Silakan hubungi admin jika ada perubahan mendesak.</p>
          </div>
      )}

      {/* Bagian Ekstrakurikuler yang Dipilih */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Pilihan Anda ({selectedExtracurriculars.length}/2)</h2>
        {selectedExtracurriculars.length > 0 ? (
          <ul className="space-y-2">
            {selectedExtracurriculars.map((extra) => (
              <li key={extra.extracurricular_id} className="flex items-center justify-between bg-blue-50 p-3 rounded-md">
                <span className="text-blue-800 font-medium">{extra.extracurriculars.name}</span>
                {!isFinalized && ( // Tombol Hapus hanya muncul jika belum finalisasi
                    <button
                      onClick={() => handleRemoveExtra(extra.extracurricular_id)}
                      className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600 transition-colors"
                      disabled={loading}
                    >
                      Hapus
                    </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">Anda belum memilih ekstrakurikuler apa pun.</p>
        )}
        {!isFinalized && selectedExtracurriculars.length >= 2 && (
            <p className="text-sm text-red-600 mt-4">Anda telah memilih 2 ekstrakurikuler. Finalisasi atau hapus untuk mengubah.</p>
        )}
      </div>

      {/* Bagian Ekstrakurikuler yang Tersedia */}
      {!isFinalized && ( // Bagian ini hanya muncul jika belum finalisasi
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Pilih Ekstrakurikuler Lainnya</h2>
          {availableExtracurriculars.length > 0 ? (
            <ul className="space-y-2">
              {availableExtracurriculars.map((extra) => (
                <li key={extra.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                  <span className="text-gray-800 font-medium">{extra.name}</span>
                  <button
                    onClick={() => handleSelectExtra(extra.id)}
                    className="bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600 transition-colors"
                    disabled={loading || selectedExtracurriculars.length >= 2}
                  >
                    Pilih
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Semua ekstrakurikuler sudah dipilih atau tidak ada yang tersedia.</p>
          )}
        </div>
      )}

      {/* Tombol Finalisasi Pilihan */}
      {!isFinalized && selectedExtracurriculars.length > 0 && ( // Tampilkan hanya jika belum finalisasi & sudah ada pilihan
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <button
                onClick={handleFinalizeChoices}
                className="bg-purple-600 text-white p-4 rounded-lg shadow-md hover:bg-purple-700 transition-colors text-lg font-semibold flex items-center justify-center space-x-2 mx-auto"
                disabled={loading}
            >
                {loading ? 'Memproses...' : 'Finalisasi Pilihan Ekstrakurikuler'}
            </button>
            <p className="text-sm text-gray-500 mt-2">Setelah difinalisasi, pilihan tidak bisa diubah.</p>
        </div>
      )}
    </div>
  );
}