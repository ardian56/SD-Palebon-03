// app/siswa/ekstra/page.jsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Import Link component if you plan to have student detail pages
import { createClient } from '@/lib/supabaseClient';
import { Calendar, Clock, Users, CheckCircle, XCircle, MapPin, AlertTriangle } from 'lucide-react';

export default function SiswaEkstraPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [availableExtras, setAvailableExtras] = useState([]);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('pilih'); // 'pilih', 'jadwal'

  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  useEffect(() => {
    checkUserAndFetchData();
  }, []);

  const checkUserAndFetchData = async () => {
    setLoading(true);
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (!session || sessionError) {
      router.push('/auth/signin');
      return;
    }

    setUser(session.user);

    // Ambil data profil siswa
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('name, role, class_id, extracurricular_finalized, classes(name)')
      .eq('id', session.user.id)
      .single();

    if (profileError || profile?.role !== 'siswa') {
      setMessage('Akses ditolak: Hanya siswa yang dapat mengakses halaman ini.');
      return;
    }
    setUserData(profile);

    // Ambil ekstrakurikuler yang tersedia
    await fetchAvailableExtras(profile.class_id);
    
    // Ambil ekstrakurikuler yang sudah dipilih
    await fetchSelectedExtras(session.user.id);
    
    // Ambil jadwal ekstrakurikuler
    await fetchSchedules(session.user.id);

    setLoading(false);
  };

  const fetchAvailableExtras = async (classId) => {
    try {
      console.log('Siswa: Fetching available extracurriculars...');
      
      // Fetch extracurriculars - simplified query first
      const { data: ekstrasData, error: ekstrasError } = await supabase
        .from('extracurriculars')
        .select('*');

      if (ekstrasError) {
        console.error('Error fetching extracurriculars:', ekstrasError);
        setMessage('Gagal memuat data ekstrakurikuler: ' + ekstrasError.message);
        return;
      }
      
      console.log('Siswa: Raw extracurriculars data:', ekstrasData);

      if (!ekstrasData || ekstrasData.length === 0) {
        console.log('Siswa: No extracurriculars found in database');
        setAvailableExtras([]);
        return;
      }

      // Fetch all schedules
      const { data: schedulesData, error: schedulesError } = await supabase
        .from('extracurricular_schedules')
        .select('*');

      if (schedulesError) {
        console.error('Error fetching schedules:', schedulesError);
        // Continue without schedules
      }
      console.log('Siswa: All schedules data:', schedulesData);

      // Merge schedules into extracurriculars data
      const ekstrasWithSchedules = ekstrasData.map(ekstra => {
        const schedules = schedulesData ? schedulesData.filter(s => s.extracurricular_id === ekstra.id) : [];
        return {
          ...ekstra,
          extracurricular_schedules: schedules
        };
      });
      
      console.log('Siswa: Final ekstras with schedules:', ekstrasWithSchedules);
      setAvailableExtras(ekstrasWithSchedules);
    } catch (err) {
      console.error('Unexpected error fetching available extras:', err);
      setMessage('Error tak terduga: ' + err.message);
    }
  };

  const fetchSelectedExtras = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('student_extracurriculars')
        .select(`
          id,
          extracurricular_id,
          extracurriculars(id, name, description)
        `)
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching selected extras:', error);
        return;
      }
      
      console.log('Selected extras data:', data);
      setSelectedExtras(data || []);
    } catch (err) {
      console.error('Unexpected error fetching selected extras:', err);
    }
  };

  const fetchSchedules = async (userId) => {
    try {
      console.log('Siswa: Fetching schedules for user:', userId);
      
      // Pertama ambil ekstrakurikuler yang dipilih siswa
      const { data: selectedExtrasData, error: selectedError } = await supabase
        .from('student_extracurriculars')
        .select('extracurricular_id')
        .eq('user_id', userId);

      if (selectedError) {
        console.error('Error fetching selected extracurriculars:', selectedError);
        return;
      }

      console.log('Siswa: Selected extracurricular IDs:', selectedExtrasData);

      if (!selectedExtrasData || selectedExtrasData.length === 0) {
        console.log('Siswa: No extracurriculars selected');
        setSchedules([]);
        return;
      }

      // Ambil jadwal berdasarkan ekstrakurikuler yang dipilih
      const extraIds = selectedExtrasData.map(se => se.extracurricular_id);
      const { data: schedulesData, error: schedulesError } = await supabase
        .from('extracurricular_schedules')
        .select(`
          id, day_of_week, start_time, end_time, location, extracurricular_id,
          extracurriculars(id, name)
        `)
        .in('extracurricular_id', extraIds);

      if (schedulesError) {
        console.error('Error fetching schedules:', schedulesError);
        return;
      }
      
      console.log('Siswa: Schedules data:', schedulesData);
      setSchedules(schedulesData || []);
    } catch (err) {
      console.error('Unexpected error fetching schedules:', err);
    }
  };

  // Fungsi untuk mengecek konflik jadwal
  const hasScheduleConflict = (extraId, newSchedules) => {
    // Jika tidak ada jadwal baru, tidak ada konflik
    if (!newSchedules || newSchedules.length === 0) {
      return false;
    }

    // Jika ekstrakurikuler sudah dipilih, tidak ada konflik
    if (isSelected(extraId)) {
      return false;
    }
    
    for (const newSchedule of newSchedules) {
      for (const existingSchedule of schedules) {
        if (newSchedule.day_of_week === existingSchedule.day_of_week) {
          const newStart = newSchedule.start_time;
          const newEnd = newSchedule.end_time;
          const existingStart = existingSchedule.start_time;
          const existingEnd = existingSchedule.end_time;

          // Cek apakah ada overlap waktu
          if ((newStart < existingEnd && newEnd > existingStart)) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const handleSelectExtra = async (extraId) => {
    if (userData?.extracurricular_finalized) {
      setMessage('Pilihan ekstrakurikuler sudah difinalisasi dan tidak dapat diubah.');
      return;
    }

    if (selectedExtras.length >= 2) {
      setMessage('Anda hanya dapat memilih maksimal 2 ekstrakurikuler.');
      return;
    }

    // Ambil data ekstrakurikuler yang akan dipilih
    const extraToSelect = availableExtras.find(e => e.id === extraId);
    if (!extraToSelect) {
      setMessage('Ekstrakurikuler tidak ditemukan.');
      return;
    }

    // Cek konflik jadwal hanya jika ekstrakurikuler memiliki jadwal
    if (extraToSelect.extracurricular_schedules && 
        extraToSelect.extracurricular_schedules.length > 0) {
      if (hasScheduleConflict(extraToSelect.id, extraToSelect.extracurricular_schedules)) {
        setMessage('Jadwal ekstrakurikuler ini bertabrakan dengan ekstrakurikuler yang sudah Anda pilih.');
        return;
      }
    }

    const { error } = await supabase
      .from('student_extracurriculars')
      .insert({
        user_id: user.id,
        extracurricular_id: extraId
      });

    if (error) {
      setMessage('Gagal memilih ekstrakurikuler: ' + error.message);
      return;
    }

    setMessage('Ekstrakurikuler berhasil dipilih!');
    await fetchSelectedExtras(user.id);
    await fetchSchedules(user.id);
  };

  const handleUnselectExtra = async (extraId) => {
    if (userData?.extracurricular_finalized) {
      setMessage('Pilihan ekstrakurikuler sudah difinalisasi dan tidak dapat diubah.');
      return;
    }

    const { error } = await supabase
      .from('student_extracurriculars')
      .delete()
      .eq('user_id', user.id)
      .eq('extracurricular_id', extraId);

    if (error) {
      setMessage('Gagal membatalkan pilihan: ' + error.message);
      return;
    }

    setMessage('Pilihan ekstrakurikuler berhasil dibatalkan!');
    await fetchSelectedExtras(user.id);
    await fetchSchedules(user.id);
  };

  const handleFinalizeSelection = async () => {
    if (selectedExtras.length === 0) {
      setMessage('Pilih minimal 1 ekstrakurikuler sebelum finalisasi.');
      return;
    }

    if (!confirm('Yakin ingin memfinalisasi pilihan ekstrakurikuler? Setelah difinalisasi, Anda tidak dapat mengubah pilihan lagi.')) {
      return;
    }

    const { error } = await supabase
      .from('users')
      .update({ extracurricular_finalized: true })
      .eq('id', user.id);

    if (error) {
      setMessage('Gagal memfinalisasi pilihan: ' + error.message);
      return;
    }

    setMessage('Pilihan ekstrakurikuler berhasil difinalisasi!');
    // Update userData
    setUserData(prev => ({ ...prev, extracurricular_finalized: true }));
  };

  const isSelected = (extraId) => {
    return selectedExtras.some(se => se.extracurricular_id === extraId);
  };

  const canSelectMore = () => {
    return selectedExtras.length < 2 && !userData?.extracurricular_finalized;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-blue-600 text-lg">Memuat data ekstrakurikuler...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <Link href="/siswa/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Kembali ke Dashboard
      </Link>
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ekstrakurikuler</h1>
          <p className="text-gray-700 mb-4">
            Kelola pilihan ekstrakurikuler dan lihat jadwal
          </p>
          
          {message && (
            <div className={`p-4 rounded-lg mb-4 ${
              message.includes('berhasil') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {message}
            </div>
          )}

          {userData?.extracurricular_finalized && (
            <div className="bg-blue-100 border-l-4 border-blue-500 p-4 mb-4">
              <p className="text-blue-700">
                <CheckCircle className="inline w-5 h-5 mr-2" />
                Pilihan ekstrakurikuler Anda sudah difinalisasi.
              </p>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-t-lg shadow-md">
          <div className="flex border-b border-gray-200">
            {[
              { id: 'pilih', label: 'Pilih Ekstrakurikuler', icon: Users },
              { id: 'jadwal', label: 'Jadwal Saya', icon: Calendar }
            ].map(tab => {
              const Icon = tab.icon;
              const isDisabled = tab.id === 'jadwal' && !userData?.extracurricular_finalized;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => !isDisabled && setActiveTab(tab.id)}
                  disabled={isDisabled}
                  className={`flex items-center px-6 py-3 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : isDisabled 
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:text-gray-900'
                  }`}
                  title={isDisabled ? 'Finalisasi pilihan ekstrakurikuler terlebih dahulu untuk melihat jadwal' : ''}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {tab.label}
                  {isDisabled && <span className="ml-1 text-xs">(🔒)</span>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-b-lg shadow-md p-6">
          {/* Tab: Pilih Ekstrakurikuler */}
          {activeTab === 'pilih' && (
            <div>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-semibold text-gray-900">Ekstrakurikuler yang Dipilih</h2>
                  {!userData?.extracurricular_finalized && selectedExtras.length > 0 && (
                    <button
                      onClick={handleFinalizeSelection}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      Finalisasi Pilihan
                    </button>
                  )}
                </div>
                {selectedExtras.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {selectedExtras.map(se => (
                      <div key={se.extracurricular_id} className="border border-green-200 bg-green-50 rounded-lg p-4">
                        <h3 className="font-semibold text-green-800">{se.extracurriculars.name}</h3>
                        <p className="text-green-700 text-sm mb-2">{se.extracurriculars.description}</p>
                        {!userData?.extracurricular_finalized && (
                          <button
                            onClick={() => handleUnselectExtra(se.extracurricular_id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Batalkan Pilihan
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-700">Belum ada ekstrakurikuler yang dipilih.</p>
                )}
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Ekstrakurikuler Tersedia</h2>
                <div className="mb-4 text-sm text-gray-600">
                  Total ekstrakurikuler tersedia: {availableExtras.length}
                </div>
                {availableExtras.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableExtras.map(extra => {
                      const selected = isSelected(extra.id);
                      const hasSchedule = extra.extracurricular_schedules && extra.extracurricular_schedules.length > 0;
                      const hasConflict = hasSchedule && hasScheduleConflict(extra.id, extra.extracurricular_schedules);
                      
                      return (
                        <div key={extra.id} className={`border rounded-lg p-4 ${
                          selected ? 'border-green-500 bg-green-50' : 
                          hasConflict ? 'border-red-300 bg-red-50' : 'border-gray-200'
                        }`}>
                          <h3 className="font-semibold text-gray-900 mb-2">{extra.name || 'Nama tidak tersedia'}</h3>
                          <p className="text-gray-700 text-sm mb-3">{extra.description || 'Deskripsi tidak tersedia'}</p>
                          
                          {/* Tampilkan jadwal */}
                          <div className="mb-3">
                            {extra.extracurricular_schedules && extra.extracurricular_schedules.length > 0 ? (
                              <>
                                <p className="text-xs font-medium text-gray-700 mb-1">Jadwal:</p>
                                {extra.extracurricular_schedules.map((schedule, idx) => (
                                  <div key={idx} className="text-xs text-gray-600 flex items-center mb-1">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {days[schedule.day_of_week]} {schedule.start_time}-{schedule.end_time}
                                    {schedule.location && (
                                      <span className="ml-1">
                                        <MapPin className="w-3 h-3 inline mr-1" />
                                        {schedule.location}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </>
                            ) : (
                              <div className="text-xs text-yellow-600 flex items-center mb-1">
                                <Clock className="w-3 h-3 mr-1" />
                                Jadwal belum ditentukan
                              </div>
                            )}
                          </div>

                          {hasConflict && (
                            <div className="flex items-center text-red-600 text-xs mb-2">
                              <AlertTriangle className="w-4 h-4 mr-1" />
                              Jadwal bertabrakan
                            </div>
                          )}

                          {selected ? (
                            <div className="flex items-center text-green-600 text-sm">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Terpilih
                            </div>
                          ) : (
                            <button
                              onClick={() => handleSelectExtra(extra.id)}
                              disabled={!canSelectMore() || hasConflict}
                              className={`w-full py-2 px-4 rounded transition-colors ${
                                canSelectMore() && !hasConflict
                                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
                              title={!hasSchedule ? 'Jadwal belum ditentukan, tetapi bisa dipilih' : ''}
                            >
                              {!canSelectMore() ? 'Maksimal 2 pilihan' : 
                               hasConflict ? 'Jadwal bentrok' : 'Pilih'}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-700 mb-2">Tidak ada ekstrakurikuler tersedia saat ini.</p>
                    <p className="text-gray-500 text-sm">
                      Pastikan admin sudah menambahkan ekstrakurikuler di sistem.
                    </p>
                    <button 
                      onClick={() => fetchAvailableExtras()}
                      className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    >
                      Coba Lagi
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab: Jadwal */}
          {activeTab === 'jadwal' && (
            <div>
              {!userData?.extracurricular_finalized ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Calendar className="w-16 h-16 mx-auto mb-4" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Jadwal Belum Tersedia</h3>
                  <p className="text-gray-600 mb-4">
                    Finalisasi pilihan ekstrakurikuler terlebih dahulu untuk melihat jadwal Anda.
                  </p>
                  <button
                    onClick={() => setActiveTab('pilih')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                  >
                    Pilih Ekstrakurikuler
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Jadwal Ekstrakurikuler Saya</h2>
                  {schedules.length > 0 ? (
                    <div className="grid gap-4">
                      {schedules.map(schedule => {
                        const today = new Date();
                        const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1;
                        const isToday = dayOfWeek === parseInt(schedule.day_of_week);

                        return (
                          <div key={schedule.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-semibold text-lg text-gray-900">{schedule.extracurriculars.name}</h3>
                                <div className="flex items-center text-gray-700 mt-1">
                                  <Calendar className="w-4 h-4 mr-2" />
                                  <span className={isToday ? 'font-bold text-green-600' : ''}>{days[schedule.day_of_week]}</span>
                                  <Clock className="w-4 h-4 ml-4 mr-2" />
                                  <span>{schedule.start_time} - {schedule.end_time}</span>
                                  {schedule.location && (
                                    <>
                                      <MapPin className="w-4 h-4 ml-4 mr-2" />
                                      <span>{schedule.location}</span>
                                    </>
                                  )}
                                </div>
                                {isToday && (
                                  <div className="mt-2">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      Hari ini
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-400 mb-4">
                        <Calendar className="w-16 h-16 mx-auto mb-4" />
                      </div>
                      <p className="text-gray-700">Belum ada jadwal ekstrakurikuler.</p>
                      <p className="text-gray-500 text-sm mt-2">
                        Jadwal akan muncul setelah admin mengatur jadwal untuk ekstrakurikuler yang Anda pilih.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
