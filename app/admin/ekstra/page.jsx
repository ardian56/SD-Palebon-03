'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Plus, X, Edit, Trash2, Trophy, Calendar, Clock, MapPin } from 'lucide-react';

export default function AdminEkstraPage() {
  const [ekstrakurikulers, setEkstrakurikulers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEkstra, setEditingEkstra] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    day_of_week: '',
    start_time: '',
    end_time: '',
    location: '',
  });
  const [alert, setAlert] = useState(null);

  const supabase = createClient();

  const showAlert = (message, type = 'info') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  useEffect(() => {
    fetchEkstrakurikulers();
  }, []);

  const fetchEkstrakurikulers = async () => {
    setLoading(true);
    try {
      console.log('Admin: Fetching extracurriculars...');
      
      // Fetch extracurriculars with their schedules
      const { data: ekstrasData, error: ekstrasError } = await supabase
        .from('extracurriculars')
        .select('*')
        .order('name', { ascending: true });

      if (ekstrasError) {
        console.error('Error fetching extracurriculars:', ekstrasError);
        throw ekstrasError;
      }
      console.log('Admin: Extracurriculars data:', ekstrasData);

      // Fetch schedules for all extracurriculars
      const { data: schedulesData, error: schedulesError } = await supabase
        .from('extracurricular_schedules')
        .select('*');

      if (schedulesError) {
        console.error('Error fetching schedules:', schedulesError);
        // Don't throw error for schedules, just log it
        console.log('Admin: Using extracurriculars without schedules');
        setEkstrakurikulers(ekstrasData.map(ekstra => ({ ...ekstra, schedule: null })));
        return;
      }
      console.log('Admin: Schedules data:', schedulesData);

      // Merge schedules into extracurriculars data
      const ekstrasWithSchedules = ekstrasData.map(ekstra => {
        const schedule = schedulesData.find(s => s.extracurricular_id === ekstra.id);
        console.log(`Admin: Ekstra ${ekstra.name} (ID: ${ekstra.id}) - Schedule:`, schedule);
        return {
          ...ekstra,
          schedule: schedule || null
        };
      });

      console.log('Admin: Final ekstras with schedules:', ekstrasWithSchedules);
      setEkstrakurikulers(ekstrasWithSchedules || []);
    } catch (error) {
      console.error('Error fetching extracurriculars:', error);
      showAlert('Gagal memuat data ekstrakurikuler: ' + (error.message || 'Unknown error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEkstraSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description) {
      showAlert('Nama dan deskripsi wajib diisi', 'error');
      return;
    }

    // Validasi jadwal jika diisi
    if (formData.day_of_week && formData.start_time && formData.end_time) {
      if (formData.start_time >= formData.end_time) {
        showAlert('Jam mulai harus lebih awal dari jam selesai', 'error');
        return;
      }

      if (!formData.location) {
        showAlert('Lokasi wajib diisi jika jadwal diatur', 'error');
        return;
      }

      // Check for schedule conflicts with other extracurriculars
      const { data: existingSchedules, error: checkError } = await supabase
        .from('extracurricular_schedules')
        .select('*')
        .eq('day_of_week', formData.day_of_week)
        .neq('extracurricular_id', editingEkstra?.id || 0);

      if (checkError) {
        console.error('Error checking schedule conflicts:', checkError);
      } else {
        const hasTimeConflict = existingSchedules.some(schedule => {
          return (formData.start_time < schedule.end_time && formData.end_time > schedule.start_time);
        });

        if (hasTimeConflict) {
          showAlert('Jadwal bentrok dengan ekstrakurikuler lain pada hari yang sama', 'error');
          return;
        }
      }
    }

    try {
      const ekstraData = {
        name: formData.name,
        description: formData.description
      };

      let ekstraId;

      if (editingEkstra) {
        // Update ekstrakurikuler
        const { error: updateError } = await supabase
          .from('extracurriculars')
          .update(ekstraData)
          .eq('id', editingEkstra.id);

        if (updateError) throw updateError;
        ekstraId = editingEkstra.id;
        showAlert('Ekstrakurikuler berhasil diperbarui', 'success');
      } else {
        // Insert ekstrakurikuler baru
        const { data: newEkstra, error: insertError } = await supabase
          .from('extracurriculars')
          .insert([ekstraData])
          .select()
          .single();

        if (insertError) throw insertError;
        ekstraId = newEkstra.id;
        showAlert('Ekstrakurikuler berhasil ditambahkan', 'success');
      }

      // Handle schedule data
      if (formData.day_of_week && formData.start_time && formData.end_time && formData.location) {
        const scheduleData = {
          extracurricular_id: ekstraId,
          day_of_week: parseInt(formData.day_of_week),
          start_time: formData.start_time,
          end_time: formData.end_time,
          location: formData.location
        };

        if (editingEkstra?.schedule) {
          // Update existing schedule
          const { error: scheduleUpdateError } = await supabase
            .from('extracurricular_schedules')
            .update(scheduleData)
            .eq('extracurricular_id', ekstraId);

          if (scheduleUpdateError) throw scheduleUpdateError;
        } else {
          // Insert new schedule
          const { error: scheduleInsertError } = await supabase
            .from('extracurricular_schedules')
            .insert([scheduleData]);

          if (scheduleInsertError) throw scheduleInsertError;
        }
      } else if (editingEkstra?.schedule) {
        // Remove schedule if all fields are empty
        const { error: scheduleDeleteError } = await supabase
          .from('extracurricular_schedules')
          .delete()
          .eq('extracurricular_id', ekstraId);

        if (scheduleDeleteError) throw scheduleDeleteError;
      }

      setShowModal(false);
      resetEkstraForm();
      fetchEkstrakurikulers();
    } catch (error) {
      console.error('Error saving extracurricular:', error);
      showAlert('Gagal menyimpan ekstrakurikuler', 'error');
    }
  };

  const deleteEkstrakurikuler = async (id) => {
    if (!confirm('Yakin ingin menghapus ekstrakurikuler ini?')) return;

    try {
      // Delete related schedules first
      const { error: scheduleDeleteError } = await supabase
        .from('extracurricular_schedules')
        .delete()
        .eq('extracurricular_id', id);

      if (scheduleDeleteError) throw scheduleDeleteError;

      // Delete extracurricular
      const { error } = await supabase
        .from('extracurriculars')
        .delete()
        .eq('id', id);

      if (error) throw error;
      showAlert('Ekstrakurikuler berhasil dihapus', 'success');
      fetchEkstrakurikulers();
    } catch (error) {
      console.error('Error deleting extracurricular:', error);
      showAlert('Gagal menghapus ekstrakurikuler', 'error');
    }
  };

  const resetEkstraForm = () => {
    setFormData({ 
      name: '', 
      description: '',
      day_of_week: '',
      start_time: '',
      end_time: '',
      location: ''
    });
    setEditingEkstra(null);
  };

  const openEkstraModal = (ekstra = null) => {
    if (ekstra) {
      setEditingEkstra(ekstra);
      setFormData({ 
        name: ekstra.name, 
        description: ekstra.description,
        day_of_week: ekstra.schedule?.day_of_week || '',
        start_time: ekstra.schedule?.start_time || '',
        end_time: ekstra.schedule?.end_time || '',
        location: ekstra.schedule?.location || ''
      });
    } else {
      resetEkstraForm();
    }
    setShowModal(true);
  };

  const getDayName = (day) => {
    const days = {
      0: 'Senin',
      1: 'Selasa', 
      2: 'Rabu',
      3: 'Kamis',
      4: 'Jumat',
      5: 'Sabtu',
      6: 'Minggu',
      'monday': 'Senin',
      'tuesday': 'Selasa', 
      'wednesday': 'Rabu',
      'thursday': 'Kamis',
      'friday': 'Jumat',
      'saturday': 'Sabtu',
      'sunday': 'Minggu'
    };
    return days[day] || day;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#111]">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 text-white bg-[#111] min-h-screen">
      {/* Alert */}
      {alert && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg z-50 ${
          alert.type === 'success' ? 'bg-green-600' : 
          alert.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
        }`}>
          {alert.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Trophy size={24} className="text-orange-400" />
          <h2 className="text-3xl font-semibold text-white tracking-wide">Admin Ekstrakurikuler</h2>
        </div>
        <button
          onClick={() => openEkstraModal()}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg text-white transition-colors"
        >
          <Plus size={20} />
          Tambah Ekstrakurikuler
        </button>
      </div>

      {/* Ekstrakurikuler Table */}
      <div className="bg-[#1a1a1a] rounded-lg overflow-hidden border border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-[#222] text-orange-400">
            <tr>
              <th className="px-4 py-3 text-left">Nama Ekstrakurikuler</th>
              <th className="px-4 py-3 text-left">Deskripsi</th>
              <th className="px-4 py-3 text-center">Jadwal</th>
              <th className="px-4 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {ekstrakurikulers.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center text-gray-400 py-8">
                  Belum ada data ekstrakurikuler
                </td>
              </tr>
            ) : (
              ekstrakurikulers.map((ekstra, index) => (
                <tr key={ekstra.id} className={index % 2 === 0 ? 'bg-[#1a1a1a]' : 'bg-[#181818]'}>
                  <td className="px-4 py-3 font-medium">{ekstra.name}</td>
                  <td className="px-4 py-3 text-gray-300">{ekstra.description}</td>
                  <td className="px-4 py-3 text-center">
                    {ekstra.schedule ? (
                      <div className="flex flex-col items-center gap-1 text-sm">
                        <div className="flex items-center gap-1 text-blue-400">
                          <Calendar size={14} />
                          {getDayName(ekstra.schedule.day_of_week)}
                        </div>
                        <div className="flex items-center gap-1 text-green-400">
                          <Clock size={14} />
                          {ekstra.schedule.start_time} - {ekstra.schedule.end_time}
                        </div>
                        <div className="flex items-center gap-1 text-yellow-400">
                          <MapPin size={14} />
                          {ekstra.schedule.location}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">Belum ada jadwal</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => openEkstraModal(ekstra)}
                        className="text-yellow-400 hover:text-yellow-300 p-1"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => deleteEkstrakurikuler(ekstra.id)}
                        className="text-red-500 hover:text-red-400 p-1"
                        title="Hapus"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Ekstrakurikuler */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-orange-400 mb-4">
              {editingEkstra ? 'Edit Ekstrakurikuler' : 'Tambah Ekstrakurikuler'}
            </h3>
            <form onSubmit={handleEkstraSubmit} className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Nama Ekstrakurikuler
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#222] border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-orange-400"
                    placeholder="Contoh: Sepak Bola"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Deskripsi
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-[#222] border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-orange-400 h-20 resize-none"
                    placeholder="Deskripsi ekstrakurikuler..."
                    required
                  />
                </div>
              </div>

              {/* Schedule Section */}
              <div className="border-t border-gray-600 pt-4">
                <h4 className="text-lg font-medium text-gray-300 mb-3">Jadwal (Opsional)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Hari
                    </label>
                    <select
                      value={formData.day_of_week}
                      onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
                      className="w-full bg-[#222] border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-orange-400"
                    >
                      <option value="">Pilih Hari</option>
                      <option value="0">Senin</option>
                      <option value="1">Selasa</option>
                      <option value="2">Rabu</option>
                      <option value="3">Kamis</option>
                      <option value="4">Jumat</option>
                      <option value="5">Sabtu</option>
                      <option value="6">Minggu</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Lokasi
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full bg-[#222] border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-orange-400"
                      placeholder="Contoh: Lapangan Sekolah"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Jam Mulai
                    </label>
                    <input
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      className="w-full bg-[#222] border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-orange-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Jam Selesai
                    </label>
                    <input
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      className="w-full bg-[#222] border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-orange-400"
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  Jadwal dapat diisi nanti atau dibiarkan kosong jika belum ditentukan
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded transition-colors"
                >
                  {editingEkstra ? 'Update' : 'Simpan'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}