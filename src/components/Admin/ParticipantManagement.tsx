import React, { useState } from 'react';
import { Users, UserPlus, UserMinus, Search } from 'lucide-react';
import { Button } from '../UI/Button';
import { Input, Select } from '../UI/Form';
import { Table, TableHead, TableBody, TableRow, TableCell } from '../UI/Table';
import { Badge } from '../UI/Badge';
import { useInmates, useActivityParticipants } from '../../hooks/useSupabase';
import { getStatusColor, getStatusText } from '../../lib/utils';
import { Activity } from '../../lib/supabase';

interface ParticipantManagementProps {
  activity: Activity;
  onClose: () => void;
}

const ParticipantManagement: React.FC<ParticipantManagementProps> = ({ activity, onClose }) => {
  const { inmates } = useInmates();
  const { participants, addParticipant, updateParticipant, removeParticipant } = useActivityParticipants(activity.id);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInmates, setSelectedInmates] = useState<string[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  const availableInmates = inmates.filter(inmate => 
    inmate.status === 'aktif' && 
    !participants.some(p => p.inmate_id === inmate.id) &&
    inmate.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddParticipants = async () => {
    try {
      for (const inmateId of selectedInmates) {
        await addParticipant({
          activity_id: activity.id,
          inmate_id: inmateId,
          enrollment_date: new Date().toISOString().split('T')[0],
          status: 'aktif'
        });
      }
      setSelectedInmates([]);
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding participants:', error);
    }
  };

  const handleRemoveParticipant = async (participantId: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus peserta ini?')) {
      await removeParticipant(participantId);
    }
  };

  const handleUpdateStatus = async (participantId: string, newStatus: string) => {
    await updateParticipant(participantId, { status: newStatus as any });
  };

  const statusOptions = [
    { value: 'aktif', label: 'Aktif' },
    { value: 'nonaktif', label: 'Non-Aktif' },
    { value: 'bermasalah', label: 'Bermasalah' },
    { value: 'dropout', label: 'Dropout' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Kelola Peserta</h3>
          <p className="text-sm text-gray-600">
            {participants.length} dari {activity.max_participants} peserta
          </p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Tambah Peserta
        </Button>
      </div>

      {/* Add Participants Form */}
      {showAddForm && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-3">Tambah Peserta Baru</h4>
          
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Cari nama napi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded">
              {availableInmates.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  {searchTerm ? 'Tidak ada napi yang ditemukan' : 'Semua napi aktif sudah terdaftar'}
                </p>
              ) : (
                availableInmates.map((inmate) => (
                  <label key={inmate.id} className="flex items-center p-3 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedInmates.includes(inmate.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedInmates([...selectedInmates, inmate.id]);
                        } else {
                          setSelectedInmates(selectedInmates.filter(id => id !== inmate.id));
                        }
                      }}
                      className="mr-3"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{inmate.name}</p>
                      <p className="text-sm text-gray-500">{inmate.prison_class} • {inmate.nik}</p>
                    </div>
                  </label>
                ))
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowAddForm(false);
                  setSelectedInmates([]);
                  setSearchTerm('');
                }}
              >
                Batal
              </Button>
              <Button
                onClick={handleAddParticipants}
                disabled={selectedInmates.length === 0}
              >
                Tambah {selectedInmates.length} Peserta
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Participants List */}
      <div className="border border-gray-200 rounded-lg">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell isHeader>Nama</TableCell>
              <TableCell isHeader>NIK</TableCell>
              <TableCell isHeader>Kelas</TableCell>
              <TableCell isHeader>Tanggal Daftar</TableCell>
              <TableCell isHeader>Status</TableCell>
              <TableCell isHeader>Nilai</TableCell>
              <TableCell isHeader>Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {participants.length === 0 ? (
              <TableRow>
                <TableCell className="text-center py-8 text-gray-500" colSpan={7}>
                  Belum ada peserta terdaftar
                </TableCell>
              </TableRow>
            ) : (
              participants.map((participant) => (
                <TableRow key={participant.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{participant.inmate?.name}</p>
                      <p className="text-sm text-gray-500">{participant.inmate?.gender}</p>
                    </div>
                  </TableCell>
                  <TableCell>{participant.inmate?.nik}</TableCell>
                  <TableCell>{participant.inmate?.prison_class}</TableCell>
                  <TableCell>{participant.enrollment_date}</TableCell>
                  <TableCell>
                    <Select
                      value={participant.status}
                      onChange={(e) => handleUpdateStatus(participant.id, e.target.value)}
                      options={statusOptions}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={participant.final_score || ''}
                      onChange={(e) => updateParticipant(participant.id, { 
                        final_score: parseFloat(e.target.value) || null 
                      })}
                      placeholder="0-100"
                      className="w-20"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleRemoveParticipant(participant.id)}
                    >
                      <UserMinus className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end">
        <Button onClick={onClose}>
          Selesai
        </Button>
      </div>
    </div>
  );
};

export default ParticipantManagement;
