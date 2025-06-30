// app/guru/absen/[formId]/page.jsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabaseClient';

// Import Chart.js components
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Register Chart.js elements
ChartJS.register(ArcElement, Tooltip, Legend);

export default function DetailAbsenPage() {
  const router = useRouter();
  const params = useParams();
  const formId = params.formId;
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [formDetails, setFormDetails] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [summary, setSummary] = useState({ totalSiswa: 0, hadir: 0, tidakHadir: 0, terlambat: 0 });

  // Function to fetch historical attendance for a given student
  const fetchStudentAttendanceHistory = async (studentId, studentClassId) => {
    // 1. Get all attendance forms for the student's class (or general forms if applicable)
    //    We need this to determine forms they 'should have' attended but might not have a record for.
    const { data: allFormsInClass, error: formsError } = await supabase
      .from('attendance_forms')
      .select('id, date, start_time, end_time')
      .eq('class_id', studentClassId)
      .order('date', { ascending: true }); // Order to process chronologically

    if (formsError) {
      console.error(`Error fetching forms for history of student ${studentId}:`, formsError.message);
      return null;
    }

    // 2. Get all *explicit* attendance records for this student
    const { data: explicitRecords, error: recordsError } = await supabase
      .from('attendance_records')
      .select('form_id, status, submitted_at')
      .eq('student_id', studentId);

    if (recordsError) {
      console.error(`Error fetching explicit records for student ${studentId}:`, recordsError.message);
      return null;
    }

    const recordsMap = new Map(explicitRecords.map(r => [r.form_id, r]));

    let hadirCount = 0;
    let tidakHadirCount = 0;
    let terlambatCount = 0;

    const now = new Date(); // Current time for checking if a form is 'over'

    // Iterate through all forms relevant to the student's class
    for (const form of allFormsInClass) {
      const formEndTime = new Date(`${form.date}T${form.end_time}`);
      const formStartTime = new Date(`${form.date}T${form.start_time}`);
      const lateThreshold = new Date(formStartTime.getTime() + 60 * 60 * 1000); // 1 hour grace

      const studentRecord = recordsMap.get(form.id);

      if (studentRecord) {
        // If an explicit record exists
        const submittedAt = new Date(studentRecord.submitted_at);
        if (studentRecord.status === 'Hadir') {
          if (submittedAt > lateThreshold) {
            terlambatCount++;
          } else {
            hadirCount++;
          }
        } else if (studentRecord.status === 'Tidak Hadir') {
          tidakHadirCount++;
        }
        // Other statuses if you have them, e.g., 'Izin', 'Sakit'
      } else {
        // If no explicit record exists, check if the form is past due
        if (now > formEndTime) {
          tidakHadirCount++; // Count as 'Tidak Hadir' if missed and form is over
        }
      }
    }

    return { hadir: hadirCount, tidakHadir: tidakHadirCount, terlambat: terlambatCount };
  };


  useEffect(() => {
    if (!formId) return;

    const fetchDetails = async () => {
      setLoading(true);

      const { data: form, error: formError } = await supabase
        .from('attendance_forms')
        .select('*, classes(name)')
        .eq('id', formId)
        .single();

      if (formError || !form) {
        setMessage('Gagal memuat detail form atau form tidak ditemukan.');
        setLoading(false);
        return;
      }
      setFormDetails(form);

      const { data: students, error: studentsError } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('role', 'siswa')
        .eq('class_id', form.class_id) // Filter students by the class associated with the form
        .order('name', { ascending: true });

      if (studentsError) {
        setMessage('Gagal memuat daftar siswa.');
        setLoading(false);
        return;
      }

      const { data: records, error: recordsError } = await supabase
        .from('attendance_records')
        .select('student_id, status, submitted_at')
        .eq('form_id', formId);

      if (recordsError) {
        setMessage('Gagal memuat data absensi.');
        setLoading(false);
        return;
      }

      const now = new Date();
      const endTime = new Date(`${form.date}T${form.end_time}`);
      const isExpired = now > endTime;

      const formStartTime = new Date(`${form.date}T${form.start_time}`);
      const lateThreshold = new Date(formStartTime.getTime() + 60 * 60 * 1000); // 1 hour = 60 minutes * 60 seconds * 1000 milliseconds

      const recordsMap = new Map(records.map(r => [r.student_id, { status: r.status, submitted_at: r.submitted_at }]));
      
      const combinedData = await Promise.all(students.map(async (student) => {
        const record = recordsMap.get(student.id);
        let finalStatus = 'Belum Mengisi';
        let submissionTime = null;
        let isLate = false;

        if (record) {
          submissionTime = new Date(record.submitted_at);
          if (record.status === 'Hadir' && submissionTime > lateThreshold) {
            isLate = true;
            finalStatus = 'Terlambat';
          } else {
            finalStatus = record.status;
          }
        } else if (isExpired) {
          finalStatus = 'Tidak Hadir';
        }

        // Fetch historical data for this student, passing the class ID
        const history = await fetchStudentAttendanceHistory(student.id, form.class_id);

        return {
          ...student,
          status: finalStatus,
          submitted_at: submissionTime,
          is_late: isLate,
          history: history,
        };
      }));
      setAttendanceData(combinedData);

      const totalSiswa = students.length;
      const hadirCount = combinedData.filter(s => s.status === 'Hadir').length;
      const tidakHadirCount = combinedData.filter(s => s.status === 'Tidak Hadir').length;
      const terlambatCount = combinedData.filter(s => s.status === 'Terlambat').length;

      setSummary({ totalSiswa, hadir: hadirCount, tidakHadir: tidakHadirCount, terlambat: terlambatCount });
      setLoading(false);
    };

    fetchDetails();
  }, [formId, supabase]);

  if (loading) {
    return (
      <div className="p-8 text-center bg-gray-50 min-h-screen">Memuat detail absensi...</div>
    );
  }
  
  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-8">
      <div className="container mx-auto max-w-5xl">
        <Link href="/guru/absen" className="text-blue-600 hover:underline mb-4 inline-block">&larr; Kembali ke Daftar Form</Link>
        
        {formDetails && (
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Detail Absensi - {formDetails.title}</h1>
        )}

        {message && <p className="mb-4 text-red-600">{message}</p>}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-6">
          <div className="bg-white p-4 rounded-lg shadow text-center">
              <h3 className="text-lg text-gray-800">Total Siswa</h3>
              <p className="text-3xl font-bold text-gray-900">{summary.totalSiswa}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
              <h3 className="text-lg text-green-600">Hadir</h3>
              <p className="text-3xl font-bold text-green-600">{summary.hadir}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
              <h3 className="text-lg text-yellow-600">Terlambat</h3>
              <p className="text-3xl font-bold text-yellow-600">{summary.terlambat}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
              <h3 className="text-lg text-red-600">Tidak Hadir</h3>
              <p className="text-3xl font-bold text-red-600">{summary.tidakHadir}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Detail Form</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <h3 className="font-semibold text-gray-800">Deskripsi</h3>
                    <p className="text-gray-600">{formDetails?.description || '-'}</p>
                </div>
                <div>
                    <h3 className="font-semibold text-gray-800">Waktu Aktif</h3>
                    <p className="text-gray-600">{formDetails ? `${formDetails.start_time.substring(0, 5)} - ${formDetails.end_time.substring(0, 5)}`: '-'}</p>
                </div>
            </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Daftar Absensi Siswa</h2>
          <div className="space-y-3">
            {attendanceData.map(student => (
              <div key={student.id} className="flex justify-between items-center p-3 border-b border-gray-200">
                <div>
                  <p className="font-bold text-gray-900">{student.name}</p>
                  <p className="text-sm text-gray-500">{student.email}</p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full text-white ${
                    student.status === 'Hadir' ? 'bg-green-500' : 
                    student.status === 'Terlambat' ? 'bg-yellow-500' :
                    student.status === 'Tidak Hadir' ? 'bg-red-500' : 
                    'bg-gray-400'
                  }`}>
                    {student.status}
                  </span>
                  {student.submitted_at && (
                      <p className="text-xs text-gray-500 mt-1">{new Date(student.submitted_at).toLocaleString('id-ID')}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Section for individual student attendance graphs */}
          <h2 className="text-xl font-bold mt-8 mb-4 text-gray-900">Grafik Kehadiran Siswa Per Siswa</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {attendanceData.map(student => {
                const hadirCount = student.history?.hadir || 0;
                const terlambatCount = student.history?.terlambat || 0;
                const tidakHadirCount = student.history?.tidakHadir || 0;

                const chartData = {
                    labels: ['Hadir', 'Terlambat', 'Tidak Hadir'],
                    datasets: [
                        {
                            data: [hadirCount, terlambatCount, tidakHadirCount],
                            backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
                            borderColor: ['#ffffff', '#ffffff', '#ffffff'],
                            borderWidth: 1,
                        },
                    ],
                };

                const chartOptions = {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                generateLabels: function(chart) {
                                    const data = chart.data;
                                    if (data.labels.length && data.datasets.length) {
                                        return data.labels.map(function(label, i) {
                                            const backgroundColor = data.datasets[0].backgroundColor[i];
                                            const borderColor = data.datasets[0].borderColor[i];
                                            const borderWidth = data.datasets[0].borderWidth[i];

                                            return {
                                                text: label,
                                                fillStyle: backgroundColor,
                                                strokeStyle: borderColor,
                                                lineWidth: borderWidth,
                                                hidden: false, // Always show in legend
                                                index: i,
                                            };
                                        });
                                    }
                                    return [];
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    let label = context.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    if (context.parsed !== null) {
                                        label += context.parsed;
                                    }
                                    return label;
                                }
                            }
                        },
                    },
                };

                const hasData = (hadirCount + terlambatCount + tidakHadirCount) > 0;

                return (
                    <div key={`chart-${student.id}`} className="bg-gray-50 p-4 rounded-lg shadow-sm flex flex-col items-center">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">{student.name}</h3>
                        {student.history ? (
                            <div className="w-full max-w-xs">
                                {hasData ? (
                                     <Doughnut data={chartData} options={chartOptions} />
                                ) : (
                                    <div className="mt-2 p-4 bg-white border border-gray-200 rounded-md text-center text-gray-500">
                                        Tidak ada data kehadiran yang tercatat untuk grafik.
                                    </div>
                                )}
                                <div className="mt-4 text-sm text-gray-700 text-center">
                                    <p>Total Hadir: {hadirCount}</p>
                                    <p>Total Terlambat: {terlambatCount}</p>
                                    <p>Total Tidak Hadir: {tidakHadirCount}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm">Riwayat kehadiran tidak tersedia.</p>
                        )}
                    </div>
                );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}