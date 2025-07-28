import clsx, { ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  }).format(amount);
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'aktif':
      return 'bg-green-100 text-green-800';
    case 'nonaktif':
      return 'bg-gray-100 text-gray-800';
    case 'bermasalah':
      return 'bg-yellow-100 text-yellow-800';
    case 'dropout':
      return 'bg-red-100 text-red-800';
    case 'pending':
      return 'bg-blue-100 text-blue-800';
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getStatusText(status: string): string {
  switch (status) {
    case 'aktif':
      return 'Aktif';
    case 'nonaktif':
      return 'Non-Aktif';
    case 'bermasalah':
      return 'Bermasalah';
    case 'dropout':
      return 'Drop Out';
    case 'pending':
      return 'Menunggu';
    case 'approved':
      return 'Disetujui';
    case 'rejected':
      return 'Ditolak';
    case 'planned':
      return 'Direncanakan';
    case 'ongoing':
      return 'Berlangsung';
    case 'completed':
      return 'Selesai';
    case 'cancelled':
      return 'Dibatalkan';
    case 'hadir':
      return 'Hadir';
    case 'tidak_hadir':
      return 'Tidak Hadir';
    case 'izin':
      return 'Izin';
    case 'sakit':
      return 'Sakit';
    default:
      return status;
  }
}

export function generateWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  const formattedPhone = cleanPhone.startsWith('0') 
    ? '62' + cleanPhone.slice(1) 
    : cleanPhone.startsWith('62') 
    ? cleanPhone 
    : '62' + cleanPhone;
  
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
}

export function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

export function validateNIK(nik: string): boolean {
  // NIK Indonesia should be 16 digits
  return /^\d{16}$/.test(nik);
}

export function validatePhone(phone: string): boolean {
  // Indonesian phone number validation
  return /^(\+62|62|0)8[1-9][0-9]{6,9}$/.test(phone.replace(/\s/g, ''));
}

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export const downloadPDF = (pdfUrl: string, filename: string) => {
  const link = document.createElement('a');
  link.href = pdfUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
