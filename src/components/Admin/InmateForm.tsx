import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../UI/Button';
import { Input, Textarea, Select } from '../UI/Form';
import { Inmate } from '../../lib/supabase';
import { validateNIK } from '../../lib/utils';

const inmateSchema = z.object({
  name: z.string().min(1, 'Nama harus diisi'),
  nik: z.string().min(16, 'NIK harus 16 digit').max(16, 'NIK harus 16 digit').refine(validateNIK, 'NIK tidak valid'),
  birth_date: z.string().min(1, 'Tanggal lahir harus diisi'),
  birth_place: z.string().min(1, 'Tempat lahir harus diisi'),
  gender: z.enum(['Laki-laki', 'Perempuan']),
  address: z.string().min(1, 'Alamat harus diisi'),
  phone: z.string().optional(),
  emergency_contact: z.string().optional(),
  prison_class: z.string().min(1, 'Kelas tahanan harus diisi'),
  entry_date: z.string().min(1, 'Tanggal masuk harus diisi'),
  status: z.enum(['aktif', 'nonaktif', 'bermasalah', 'dropout']),
  notes: z.string().optional()
});

type InmateFormData = z.infer<typeof inmateSchema>;

interface InmateFormProps {
  inmate?: Inmate | null;
  onSubmit: (data: InmateFormData) => void;
  onCancel: () => void;
}

const InmateForm: React.FC<InmateFormProps> = ({ inmate, onSubmit, onCancel }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<InmateFormData>({
    resolver: zodResolver(inmateSchema),
    defaultValues: inmate ? {
      name: inmate.name,
      nik: inmate.nik,
      birth_date: inmate.birth_date,
      birth_place: inmate.birth_place,
      gender: inmate.gender as 'Laki-laki' | 'Perempuan',
      address: inmate.address,
      phone: inmate.phone || '',
      emergency_contact: inmate.emergency_contact || '',
      prison_class: inmate.prison_class,
      entry_date: inmate.entry_date,
      status: inmate.status,
      notes: inmate.notes || ''
    } : {
      status: 'aktif',
      gender: 'Laki-laki'
    }
  });

  const genderOptions = [
    { value: 'Laki-laki', label: 'Laki-laki' },
    { value: 'Perempuan', label: 'Perempuan' }
  ];

  const statusOptions = [
    { value: 'aktif', label: 'Aktif' },
    { value: 'nonaktif', label: 'Non-Aktif' },
    { value: 'bermasalah', label: 'Bermasalah' },
    { value: 'dropout', label: 'Dropout' }
  ];

  const prisonClassOptions = [
    { value: 'Kelas I', label: 'Kelas I' },
    { value: 'Kelas IIA', label: 'Kelas IIA' },
    { value: 'Kelas IIB', label: 'Kelas IIB' },
    { value: 'Kelas III', label: 'Kelas III' },
    { value: 'Khusus', label: 'Khusus' }
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Personal Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Informasi Pribadi</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nama Lengkap"
            {...register('name')}
            error={errors.name?.message}
            placeholder="Masukkan nama lengkap"
          />
          
          <Input
            label="NIK"
            {...register('nik')}
            error={errors.nik?.message}
            placeholder="16 digit NIK"
            maxLength={16}
          />
          
          <Input
            label="Tempat Lahir"
            {...register('birth_place')}
            error={errors.birth_place?.message}
            placeholder="Kota/Kabupaten"
          />
          
          <Input
            label="Tanggal Lahir"
            type="date"
            {...register('birth_date')}
            error={errors.birth_date?.message}
          />
          
          <Select
            label="Jenis Kelamin"
            {...register('gender')}
            error={errors.gender?.message}
            options={genderOptions}
          />
          
          <Input
            label="No. Telepon"
            {...register('phone')}
            error={errors.phone?.message}
            placeholder="081234567890"
          />
        </div>
        
        <div className="mt-4">
          <Textarea
            label="Alamat Lengkap"
            {...register('address')}
            error={errors.address?.message}
            placeholder="Alamat lengkap sesuai KTP"
            rows={3}
          />
        </div>
        
        <div className="mt-4">
          <Input
            label="Kontak Darurat"
            {...register('emergency_contact')}
            error={errors.emergency_contact?.message}
            placeholder="Nama dan nomor kontak keluarga"
          />
        </div>
      </div>

      {/* Prison Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Informasi Lapas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Kelas Tahanan"
            {...register('prison_class')}
            error={errors.prison_class?.message}
            options={prisonClassOptions}
          />
          
          <Input
            label="Tanggal Masuk"
            type="date"
            {...register('entry_date')}
            error={errors.entry_date?.message}
          />
          
          <Select
            label="Status"
            {...register('status')}
            error={errors.status?.message}
            options={statusOptions}
          />
        </div>
        
        <div className="mt-4">
          <Textarea
            label="Catatan Tambahan"
            {...register('notes')}
            error={errors.notes?.message}
            placeholder="Catatan khusus tentang napi..."
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {inmate ? 'Perbarui' : 'Simpan'} Data Napi
        </Button>
      </div>
    </form>
  );
};

export default InmateForm;
