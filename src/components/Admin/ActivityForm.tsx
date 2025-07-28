import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../UI/Button';
import { Input, Textarea, Select } from '../UI/Form';
import { Activity } from '../../lib/supabase';

const activitySchema = z.object({
  title: z.string().min(1, 'Nama kegiatan harus diisi'),
  description: z.string().optional(),
  start_date: z.string().min(1, 'Tanggal mulai harus diisi'),
  end_date: z.string().optional(),
  max_participants: z.number().min(1, 'Maksimal peserta minimal 1').max(100, 'Maksimal peserta tidak boleh lebih dari 100'),
  instructor_name: z.string().optional(),
  location: z.string().optional(),
  status: z.enum(['planned', 'ongoing', 'completed', 'cancelled'])
});

type ActivityFormData = z.infer<typeof activitySchema>;

interface ActivityFormProps {
  activity?: Activity | null;
  onSubmit: (data: ActivityFormData) => void;
  onCancel: () => void;
}

const ActivityForm: React.FC<ActivityFormProps> = ({ activity, onSubmit, onCancel }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: activity ? {
      title: activity.title,
      description: activity.description || '',
      start_date: activity.start_date ? new Date(activity.start_date).toISOString().split('T')[0] : '',
      end_date: activity.end_date ? new Date(activity.end_date).toISOString().split('T')[0] : '',
      max_participants: activity.max_participants || 20,
      instructor_name: activity.instructor_name || '',
      location: activity.location || '',
      status: activity.status || 'planned'
    } : {
      title: '',
      description: '',
      start_date: '',
      end_date: '',
      max_participants: 20,
      instructor_name: '',
      location: '',
      status: 'planned'
    }
  });

  // Tambahkan fungsi untuk memproses data sebelum dikirim ke onSubmit
  const processSubmit = (data: ActivityFormData) => {
    // Pastikan field opsional yang kosong dikirim sebagai null, bukan undefined
    const processedData = {
      ...data,
      description: data.description || null,
      end_date: data.end_date || null,
      instructor_name: data.instructor_name || null,
      location: data.location || null
    };
    console.log('Data yang akan dikirim ke Supabase:', processedData);
    onSubmit(processedData);
  };

  const statusOptions = [
    { value: 'planned', label: 'Direncanakan' },
    { value: 'ongoing', label: 'Berlangsung' },
    { value: 'completed', label: 'Selesai' },
    { value: 'cancelled', label: 'Dibatalkan' }
  ];

  return (
    <form onSubmit={handleSubmit(processSubmit)} className="space-y-6">
      {/* Row 1: Nama Kegiatan dan Narasumber */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Nama Kegiatan"
          {...register('title')}
          error={errors.title?.message}
          placeholder="Contoh: Pelatihan Menjahit"
        />
        
        <Input
          label="Narasumber"
          {...register('instructor_name')}
          error={errors.instructor_name?.message}
          placeholder="Nama narasumber"
        />
      </div>

      {/* Row 2: Deskripsi */}
      <Textarea
        label="Deskripsi"
        {...register('description')}
        error={errors.description?.message}
        placeholder="Deskripsi kegiatan..."
        rows={3}
      />

      {/* Row 3: Tanggal dan Maksimal Peserta */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Tanggal Mulai"
          type="date"
          {...register('start_date')}
          error={errors.start_date?.message}
        />
        
        <Input
          label="Tanggal Selesai"
          type="date"
          {...register('end_date')}
          error={errors.end_date?.message}
        />
        
        <Input
          label="Maksimal Peserta"
          type="number"
          {...register('max_participants', { valueAsNumber: true })}
          error={errors.max_participants?.message}
          min="1"
          max="100"
        />
      </div>

      {/* Row 4: Lokasi dan Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Lokasi"
          {...register('location')}
          error={errors.location?.message}
          placeholder="Ruang/tempat kegiatan"
        />
        
        <Select
          label="Status"
          {...register('status')}
          error={errors.status?.message}
          options={statusOptions}
        />
      </div>

      {/* Submit buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {activity ? 'Perbarui' : 'Simpan'} Kegiatan
        </Button>
      </div>
    </form>
  );
};

export default ActivityForm;
