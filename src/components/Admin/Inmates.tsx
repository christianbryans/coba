import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  FileText,
  Award,
  Eye,
  UserCheck,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../UI/Card';
import { Button } from '../UI/Button';
import { Badge } from '../UI/Badge';
import { Input, Select } from '../UI/Form';
import { Modal } from '../UI/Modal';
import { Table, TableHead, TableBody, TableRow, TableCell } from '../UI/Table';
import { useInmates } from '../../hooks/useSupabase';
import { formatDate, getStatusColor, getStatusText, calculateAge } from '../../lib/utils';
import { generateInmateResume } from '../../lib/pdfGenerator';
import InmateForm from './InmateForm';
import InmateDetail from './InmateDetail';

const Inmates: React.FC = () => {
  const { inmates, loading, addInmate, updateInmate, deleteInmate } = useInmates();
  const [selectedInmate, setSelectedInmate] = useState<any>(null);
  const [showInmateForm, setShowInmateForm] = useState(false);
  const [showInmateDetail, setShowInmateDetail] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');

  const filteredInmates = inmates.filter(inmate => {
    const matchesSearch = inmate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inmate.nik.includes(searchTerm) ||
                         inmate.prison_class.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || inmate.status === statusFilter;
    const matchesClass = !classFilter || inmate.prison_class === classFilter;
    return matchesSearch && matchesStatus && matchesClass;
  });

  const handleAddInmate = () => {
    setSelectedInmate(null);
    setShowInmateForm(true);
  };

  const handleEditInmate = (inmate: any) => {
    setSelectedInmate(inmate);
    setShowInmateForm(true);
  };

  const handleViewInmate = (inmate: any) => {
    setSelectedInmate(inmate);
    setShowInmateDetail(true);
  };

  const handleDeleteInmate = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data napi ini?')) {
      await deleteInmate(id);
    }
  };

  const handlePrintResume = async (inmate: any) => {
    // Here you would fetch activities and certifications for the inmate
    // For now, we'll pass empty arrays
    await generateInmateResume(inmate, [], []);
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
    { value: 'aktif', label: 'Aktif' },
    { value: 'nonaktif', label: 'Non-Aktif' },
    { value: 'bermasalah', label: 'Bermasalah' },
    { value: 'dropout', label: 'Dropout' }
  ];

  const uniqueClasses = [...new Set(inmates.map(i => i.prison_class))];
  const classOptions = [
    { value: '', label: 'Semua Kelas' },
    ...uniqueClasses.map(cls => ({ value: cls, label: cls }))
  ];

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Narapidana</h1>
          <p className="text-gray-600 mt-1">Kelola data dan informasi narapidana</p>
        </div>
        <Button onClick={handleAddInmate}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Napi
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Napi</p>
                <p className="text-2xl font-bold text-gray-900">{inmates.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aktif</p>
                <p className="text-2xl font-bold text-green-600">
                  {inmates.filter(i => i.status === 'aktif').length}
                </p>
              </div>
              <UserCheck className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bermasalah</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {inmates.filter(i => i.status === 'bermasalah').length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Dropout</p>
                <p className="text-2xl font-bold text-red-600">
                  {inmates.filter(i => i.status === 'dropout').length}
                </p>
              </div>
              <Award className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Cari nama, NIK, atau kelas..."
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
            <Select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              options={classOptions}
              placeholder="Filter kelas"
            />
            <Button variant="secondary">
              <Filter className="w-4 h-4 mr-2" />
              Filter Lanjutan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Inmates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Narapidana</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell isHeader>Nama</TableCell>
                <TableCell isHeader>NIK</TableCell>
                <TableCell isHeader>Umur</TableCell>
                <TableCell isHeader>Kelas Tahanan</TableCell>
                <TableCell isHeader>Tanggal Masuk</TableCell>
                <TableCell isHeader>Status</TableCell>
                <TableCell isHeader>Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInmates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    Tidak ada data napi yang ditemukan
                  </TableCell>
                </TableRow>
              ) : (
                filteredInmates.map((inmate) => (
                  <TableRow key={inmate.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{inmate.name}</p>
                        <p className="text-sm text-gray-500">{inmate.gender}</p>
                      </div>
                    </TableCell>
                    <TableCell>{inmate.nik}</TableCell>
                    <TableCell>{calculateAge(inmate.birth_date)} tahun</TableCell>
                    <TableCell>{inmate.prison_class}</TableCell>
                    <TableCell>{formatDate(inmate.entry_date)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(inmate.status)}>
                        {getStatusText(inmate.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewInmate(inmate)}
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditInmate(inmate)}
                          title="Edit Data"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handlePrintResume(inmate)}
                          title="Cetak Resume"
                        >
                          <FileText className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteInmate(inmate.id)}
                          title="Hapus Data"
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
        isOpen={showInmateForm}
        onClose={() => setShowInmateForm(false)}
        title={selectedInmate ? 'Edit Data Napi' : 'Tambah Napi Baru'}
        size="xl"
      >
        <InmateForm
          inmate={selectedInmate}
          onSubmit={(data) => {
            if (selectedInmate) {
              updateInmate(selectedInmate.id, data);
            } else {
              addInmate(data);
            }
            setShowInmateForm(false);
          }}
          onCancel={() => setShowInmateForm(false)}
        />
      </Modal>

      <Modal
        isOpen={showInmateDetail}
        onClose={() => setShowInmateDetail(false)}
        title={`Detail Napi - ${selectedInmate?.name}`}
        size="xl"
      >
        {selectedInmate && (
          <InmateDetail
            inmate={selectedInmate}
            onClose={() => setShowInmateDetail(false)}
            onEdit={(inmate) => {
              setShowInmateDetail(false);
              setSelectedInmate(inmate);
              setShowInmateForm(true);
            }}
          />
        )}
      </Modal>
    </div>
  );
};

export default Inmates;
