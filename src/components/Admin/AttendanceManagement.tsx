import React, { useState, useEffect } from 'react';
import { Calendar, Save, Users, Clock } from 'lucide-react';
import { Button } from '../UI/Button';
import { Select } from '../UI/Form';
import { Table, TableHead, TableBody, TableRow, TableCell } from '../UI/Table';
import { Badge } from '../UI/Badge';
import { supabase, Activity, Attendance } from '../../lib/supabase';
import { useActivityParticipants } from '../../hooks/useSupabase';
import { getStatusColor, getStatusText } from '../../lib/utils';
import toast from 'react-hot-toast';

interface AttendanceManagementProps {
  activity: Activity;
  onClose: () => void;
}

const AttendanceManagement: React.FC<AttendanceManagementProps> = ({ activity, onClose }) => {
  const { participants } = useActivityParticipants(activity.id);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState<Record<string, string>>({});
  const [existingAttendance, setExistingAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate, activity.id]);

  const fetchAttendance = async () => {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('activity_id', activity.id)
        .eq('date', selectedDate);

      if (error) throw error;
      setExistingAttendance(data || []);
      
      // Set initial attendance data
      const initialData: Record<string, string> = {};
      participants.forEach(participant => {
        const existing = data?.find(a => a.inmate_id === participant.inmate_id);
        initialData[participant.inmate_id] = existing?.status || 'hadir';
      });
      setAttendanceData(initialData);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error('Error loading attendance data');
    }
  };

  const handleAttendanceChange = (inmateId: string, status: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [inmateId]: status
    }));
  };

  const handleSaveAttendance = async () => {
    try {
      setLoading(true);
      
      // Delete existing attendance for this date
      await supabase
        .from('attendance')
        .delete()
        .eq('activity_id', activity.id)
        .eq('date', selectedDate);

      // Insert new attendance records
      const attendanceRecords = participants.map(participant => ({
        activity_id: activity.id,
        inmate_id: participant.inmate_id,
        date: selectedDate,
        status: attendanceData[participant.inmate_id] || 'hadir',
        recorded_by: null // Should be set to current user profile ID
      }));

      const { error } = await supabase
        .from('attendance')
        .insert(attendanceRecords);

      if (error) throw error;

      toast.success('Absensi berhasil disimpan');
      await fetchAttendance();
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast.error('Error saving attendance');
    } finally {
      setLoading(false);
    }
  };

  const attendanceOptions = [
    { value: 'hadir', label: 'Hadir' },
    { value: 'tidak_hadir', label: 'Tidak Hadir' },
    { value: 'izin', label: 'Izin' },
    { value: 'sakit', label: 'Sakit' }
  ];

  const getAttendanceStats = () => {
    const total = participants.length;
    const hadir = Object.values(attendanceData).filter(status => status === 'hadir').length;
    const tidakHadir = Object.values(attendanceData).filter(status => status === 'tidak_hadir').length;
    const izin = Object.values(attendanceData).filter(status => status === 'izin').length;
    const sakit = Object.values(attendanceData).filter(status => status === 'sakit').length;

    return { total, hadir, tidakHadir, izin, sakit };
  };

  const stats = getAttendanceStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Kelola Absensi</h3>
          <p className="text-sm text-gray-600">Rekam kehadiran peserta kegiatan</p>
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <Button onClick={handleSaveAttendance} loading={loading}>
            <Save className="w-4 h-4 mr-2" />
            Simpan Absensi
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Users className="w-5 h-5 text-blue-600 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-xl font-bold text-blue-600">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Clock className="w-5 h-5 text-green-600 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Hadir</p>
              <p className="text-xl font-bold text-green-600">{stats.hadir}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg">
          <div>
            <p className="text-sm text-gray-600">Tidak Hadir</p>
            <p className="text-xl font-bold text-red-600">{stats.tidakHadir}</p>
          </div>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div>
            <p className="text-sm text-gray-600">Izin</p>
            <p className="text-xl font-bold text-yellow-600">{stats.izin}</p>
          </div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div>
            <p className="text-sm text-gray-600">Sakit</p>
            <p className="text-xl font-bold text-purple-600">{stats.sakit}</p>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="border border-gray-200 rounded-lg">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell isHeader>No</TableCell>
              <TableCell isHeader>Nama</TableCell>
              <TableCell isHeader>NIK</TableCell>
              <TableCell isHeader>Kelas</TableCell>
              <TableCell isHeader>Status Peserta</TableCell>
              <TableCell isHeader>Kehadiran</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {participants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  Tidak ada peserta terdaftar
                </TableCell>
              </TableRow>
            ) : (
              participants.map((participant, index) => (
                <TableRow key={participant.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{participant.inmate?.name}</p>
                      <p className="text-sm text-gray-500">{participant.inmate?.gender}</p>
                    </div>
                  </TableCell>
                  <TableCell>{participant.inmate?.nik}</TableCell>
                  <TableCell>{participant.inmate?.prison_class}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(participant.status)}>
                      {getStatusText(participant.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={attendanceData[participant.inmate_id] || 'hadir'}
                      onChange={(e) => handleAttendanceChange(participant.inmate_id, e.target.value)}
                      options={attendanceOptions}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end">
        <Button variant="secondary" onClick={onClose}>
          Tutup
        </Button>
      </div>
    </div>
  );
};

export default AttendanceManagement;
