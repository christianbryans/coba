import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '../UI/Button';
import { Textarea, Select } from '../UI/Form';
import { Table, TableHead, TableBody, TableRow, TableCell } from '../UI/Table';
import { Badge } from '../UI/Badge';
import { Modal } from '../UI/Modal';
import { supabase, Activity, ActivityNote } from '../../lib/supabase';
import { useActivityParticipants } from '../../hooks/useSupabase';
import { formatDate } from '../../lib/utils';
import toast from 'react-hot-toast';

interface ActivityNotesProps {
  activity: Activity;
  onClose: () => void;
}

const ActivityNotes: React.FC<ActivityNotesProps> = ({ activity, onClose }) => {
  const { participants } = useActivityParticipants(activity.id);
  const [notes, setNotes] = useState<ActivityNote[]>([]);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [selectedNote, setSelectedNote] = useState<ActivityNote | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [selectedInmate, setSelectedInmate] = useState('');
  const [noteType, setNoteType] = useState<'positif' | 'negatif' | 'normal'>('normal');
  const [content, setContent] = useState('');
  const [instructorName, setInstructorName] = useState('');

  useEffect(() => {
    fetchNotes();
  }, [activity.id]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('activity_notes')
        .select(`
          *,
          activity:activities(*),
          inmate:inmates(*)
        `)
        .eq('activity_id', activity.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('Error loading notes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitNote = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedInmate || !content.trim()) {
      toast.error('Mohon lengkapi form catatan');
      return;
    }

    try {
      setLoading(true);
      
      const noteData = {
        activity_id: activity.id,
        inmate_id: selectedInmate,
        note_type: noteType,
        content: content.trim(),
        instructor_name: instructorName.trim() || null,
        date: new Date().toISOString().split('T')[0],
        created_by: null // Should be set to current user profile ID
      };

      if (selectedNote) {
        // Update existing note
        const { error } = await supabase
          .from('activity_notes')
          .update(noteData)
          .eq('id', selectedNote.id);

        if (error) throw error;
        toast.success('Catatan berhasil diperbarui');
      } else {
        // Create new note
        const { error } = await supabase
          .from('activity_notes')
          .insert([noteData]);

        if (error) throw error;
        toast.success('Catatan berhasil disimpan');
      }

      // Reset form
      setSelectedInmate('');
      setNoteType('normal');
      setContent('');
      setInstructorName('');
      setSelectedNote(null);
      setShowNoteForm(false);
      
      await fetchNotes();
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Error saving note');
    } finally {
      setLoading(false);
    }
  };

  const handleEditNote = (note: ActivityNote) => {
    setSelectedNote(note);
    setSelectedInmate(note.inmate_id);
    setNoteType(note.note_type);
    setContent(note.content);
    setInstructorName(note.instructor_name || '');
    setShowNoteForm(true);
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus catatan ini?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('activity_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;
      toast.success('Catatan berhasil dihapus');
      await fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Error deleting note');
    }
  };

  const getNoteBadgeColor = (type: string) => {
    switch (type) {
      case 'positif':
        return 'bg-green-100 text-green-800';
      case 'negatif':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const noteTypeOptions = [
    { value: 'normal', label: 'Normal' },
    { value: 'positif', label: 'Positif' },
    { value: 'negatif', label: 'Negatif' }
  ];

  const inmateOptions = participants.map(participant => ({
    value: participant.inmate_id,
    label: participant.inmate?.name || 'Unknown'
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Catatan Kegiatan</h3>
          <p className="text-sm text-gray-600">Kelola catatan dari narasumber</p>
        </div>
        <Button onClick={() => setShowNoteForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Catatan
        </Button>
      </div>

      {/* Notes List */}
      <div className="border border-gray-200 rounded-lg">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell isHeader>Tanggal</TableCell>
              <TableCell isHeader>Napi</TableCell>
              <TableCell isHeader>Jenis</TableCell>
              <TableCell isHeader>Catatan</TableCell>
              <TableCell isHeader>Narasumber</TableCell>
              <TableCell isHeader>Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                </TableCell>
              </TableRow>
            ) : notes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  Belum ada catatan untuk kegiatan ini
                </TableCell>
              </TableRow>
            ) : (
              notes.map((note) => (
                <TableRow key={note.id}>
                  <TableCell>{formatDate(note.date)}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{note.inmate?.name}</p>
                      <p className="text-sm text-gray-500">{note.inmate?.nik}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getNoteBadgeColor(note.note_type)}>
                      {note.note_type.charAt(0).toUpperCase() + note.note_type.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <p className="text-sm text-gray-900 line-clamp-2">{note.content}</p>
                    </div>
                  </TableCell>
                  <TableCell>{note.instructor_name || '-'}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditNote(note)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteNote(note.id)}
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
      </div>

      <div className="flex justify-end">
        <Button variant="secondary" onClick={onClose}>
          Tutup
        </Button>
      </div>

      {/* Note Form Modal */}
      <Modal
        isOpen={showNoteForm}
        onClose={() => {
          setShowNoteForm(false);
          setSelectedNote(null);
          setSelectedInmate('');
          setNoteType('normal');
          setContent('');
          setInstructorName('');
        }}
        title={selectedNote ? 'Edit Catatan' : 'Tambah Catatan Baru'}
        size="lg"
      >
        <form onSubmit={handleSubmitNote} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Pilih Napi"
              value={selectedInmate}
              onChange={(e) => setSelectedInmate(e.target.value)}
              options={inmateOptions}
              placeholder="Pilih napi..."
            />
            
            <Select
              label="Jenis Catatan"
              value={noteType}
              onChange={(e) => setNoteType(e.target.value as any)}
              options={noteTypeOptions}
            />
          </div>

          <input
            type="text"
            placeholder="Nama narasumber (opsional)"
            value={instructorName}
            onChange={(e) => setInstructorName(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />

          <Textarea
            label="Isi Catatan"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Tulis catatan untuk napi ini..."
            rows={4}
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowNoteForm(false);
                setSelectedNote(null);
                setSelectedInmate('');
                setNoteType('normal');
                setContent('');
                setInstructorName('');
              }}
            >
              Batal
            </Button>
            <Button type="submit" loading={loading}>
              {selectedNote ? 'Perbarui' : 'Simpan'} Catatan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ActivityNotes;
