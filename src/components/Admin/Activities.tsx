import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  Search,
  Filter,
  Users,
  Clock,
  MapPin,
  Edit,
  Trash2,
  FileText,
  UserPlus,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../UI/Card';
import { Button } from '../UI/Button';
import { Badge } from '../UI/Badge';
import { Input, Select } from '../UI/Form';
import { Modal } from '../UI/Modal';
import { Table, TableHead, TableBody, TableRow, TableCell } from '../UI/Table';
import { useActivities, useActivityParticipants } from '../../hooks/useSupabase';
import { formatDate, getStatusColor, getStatusText } from '../../lib/utils';
import { generateActivityDocument } from '../../lib/pdfGenerator';
import ActivityForm from './ActivityForm';
import ParticipantManagement from './ParticipantManagement';
import AttendanceManagement from './AttendanceManagement';
import ActivityNotes from './ActivityNotes';

const Activities: React.FC = () => {
  const { activities, loading, addActivity, updateActivity, deleteActivity } = useActivities();
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showAttendance, setShowAttendance] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.instructor_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || activity.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddActivity = () => {
    setSelectedActivity(null);
    setShowActivityForm(true);
  };

  const handleEditActivity = (activity: any) => {
    setSelectedActivity(activity);
    setShowActivityForm(true);
  };

  const handleDeleteActivity = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus kegiatan ini?')) {
      await deleteActivity(id);
    }
  };

  const handleManageParticipants = (activity: any) => {
    setSelectedActivity(activity);
    setShowParticipants(true);
  };

  const handleManageAttendance = (activity: any) => {
    setSelectedActivity(activity);
    setShowAttendance(true);
  };

  const handleManageNotes = (activity: any) => {
    setSelectedActivity(activity);
    setShowNotes(true);
  };

  const handlePrintDocument = async (activity: any) => {
    // Fetch participants for this activity
    const { participants } = useActivityParticipants(activity.id);
    await generateActivityDocument(activity, participants);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const statusOptions = [
    { value: '', label: 'Semua Status' },
    { value: 'planned', label: 'Direncanakan' },
    { value: 'ongoing', label: 'Berlangsung' },
    { value: 'completed', label: 'Selesai' },
    { value: 'cancelled', label: 'Dibatalkan' }
  ];

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Kegiatan</h1>
          <p className="text-gray-600 mt-1">Kelola kegiatan dan aktivitas narapidana</p>
        </div>
        <Button onClick={handleAddActivity}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Kegiatan
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Kegiatan</p>
                <p className="text-2xl font-bold text-gray-900">{activities.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Berlangsung</p>
                <p className="text-2xl font-bold text-green-600">
                  {activities.filter(a => a.status === 'ongoing').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Direncanakan</p>
                <p className="text-2xl font-bold text-blue-600">
                  {activities.filter(a => a.status === 'planned').length}
                </p>
              </div>
              <MapPin className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Selesai</p>
                <p className="text-2xl font-bold text-purple-600">
                  {activities.filter(a => a.status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Cari kegiatan atau narasumber..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={statusOptions}
              placeholder="Filter status"
            />
            <Button variant="secondary">
              <Filter className="w-4 h-4 mr-2" />
              Filter Lanjutan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Activities Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Kegiatan</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell isHeader>Nama Kegiatan</TableCell>
                <TableCell isHeader>Narasumber</TableCell>
                <TableCell isHeader>Tanggal</TableCell>
                <TableCell isHeader>Lokasi</TableCell>
                <TableCell isHeader>Peserta</TableCell>
                <TableCell isHeader>Status</TableCell>
                <TableCell isHeader>Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredActivities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    Tidak ada kegiatan yang ditemukan
                  </TableCell>
                </TableRow>
              ) : (
                filteredActivities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-500">{activity.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>{activity.instructor_name || '-'}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{formatDate(activity.start_date)}</p>
                        {activity.end_date && (
                          <p className="text-gray-500">s/d {formatDate(activity.end_date)}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{activity.location || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1 text-gray-400" />
                        <span>0/{activity.max_participants}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(activity.status)}>
                        {getStatusText(activity.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditActivity(activity)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleManageParticipants(activity)}
                        >
                          <UserPlus className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handlePrintDocument(activity)}
                        >
                          <FileText className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteActivity(activity.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modals */}
      <Modal
        isOpen={showActivityForm}
        onClose={() => setShowActivityForm(false)}
        title={selectedActivity ? 'Edit Kegiatan' : 'Tambah Kegiatan Baru'}
        size="lg"
      >
        <ActivityForm
          activity={selectedActivity}
          onSubmit={(data) => {
            if (selectedActivity) {
              updateActivity(selectedActivity.id, data);
            } else {
              addActivity(data);
            }
            setShowActivityForm(false);
          }}
          onCancel={() => setShowActivityForm(false)}
        />
      </Modal>

      <Modal
        isOpen={showParticipants}
        onClose={() => setShowParticipants(false)}
        title={`Kelola Peserta - ${selectedActivity?.title}`}
        size="xl"
      >
        {selectedActivity && (
          <ParticipantManagement
            activity={selectedActivity}
            onClose={() => setShowParticipants(false)}
          />
        )}
      </Modal>

      <Modal
        isOpen={showAttendance}
        onClose={() => setShowAttendance(false)}
        title={`Absensi - ${selectedActivity?.title}`}
        size="xl"
      >
        {selectedActivity && (
          <AttendanceManagement
            activity={selectedActivity}
            onClose={() => setShowAttendance(false)}
          />
        )}
      </Modal>

      <Modal
        isOpen={showNotes}
        onClose={() => setShowNotes(false)}
        title={`Catatan Kegiatan - ${selectedActivity?.title}`}
        size="xl"
      >
        {selectedActivity && (
          <ActivityNotes
            activity={selectedActivity}
            onClose={() => setShowNotes(false)}
          />
        )}
      </Modal>
    </div>
  );
};

export default Activities;
