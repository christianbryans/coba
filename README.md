# Sistem Monitoring Narapidana

Platform berbasis web untuk memantau aktivitas narapidana, merekomendasikan napi yang berprestasi kepada mitra, serta memungkinkan mitra untuk menilai, memilih, dan berinteraksi dengan napi yang sudah bekerja.

## 🚀 Fitur Utama

### 👤 Admin Lapas
- **Dashboard**: Grafik progres napi bekerja, daftar napi yang perlu intervensi, kegiatan hari ini
- **Kegiatan**: Tambah kegiatan baru, cetak dokumen, kelola catatan narasumber, absensi
- **Data Napi**: CRUD data napi lengkap, list kegiatan per napi, sertifikasi, cetak resume
- **Mitra**: Kelola katalog mitra, rekomendasi napi, tandai napi bermasalah

### 🤝 Mitra
- **Dashboard**: Lihat napi yang direkomendasikan, detail resume napi
- **Laporan**: Laporkan napi bermasalah, hubungi hotline lapas

## 🛠️ Tech Stack

- **Frontend**: React.js + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **UI Components**: Headless UI + Heroicons
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **PDF Generation**: jsPDF + html2canvas
- **Notifications**: React Hot Toast

## 📋 Prerequisites

- Node.js 18+ 
- npm atau yarn
- Akun Supabase

## ⚡ Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd project
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Supabase

1. Buat project baru di [Supabase](https://supabase.com)
2. Jalankan migration SQL yang ada di `supabase/migrations/`
3. Copy file `.env.example` ke `.env`:
```bash
cp .env.example .env
```
4. Isi variabel environment di `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Jalankan Development Server
```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173`

## 🗃️ Database Schema

### Tables:
- `profiles` - Data pengguna (admin/mitra)
- `inmates` - Data narapidana
- `activities` - Data kegiatan/pelatihan
- `activity_participants` - Peserta kegiatan
- `certifications` - Sertifikat napi
- `partners` - Data perusahaan mitra
- `recommendations` - Rekomendasi napi ke mitra
- `reports` - Laporan masalah
- `attendance` - Absensi kegiatan
- `activity_notes` - Catatan narasumber

### Row Level Security (RLS):
- Admin lapas: Full access ke semua data
- Mitra: Read access ke data napi & rekomendasi mereka

## 🎯 Fitur Detail

### Admin Dashboard
- Statistik real-time napi aktif/bermasalah
- Chart progres napi bekerja (12 bulan)
- Daftar kegiatan hari ini
- Alert napi yang perlu intervensi

### Manajemen Kegiatan
- Form kegiatan dengan validasi lengkap
- Kelola peserta (tambah/hapus/update status)
- Sistem absensi harian
- Catatan positif/negatif dari narasumber
- Generate dokumen PDF untuk narasumber

### Data Narapidana
- Form data lengkap dengan validasi NIK
- Status tracking (aktif/nonaktif/bermasalah/dropout)
- Riwayat kegiatan dan sertifikasi
- Generate resume PDF otomatis

### Sistem Rekomendasi
- Admin rekomendasikan napi ke mitra
- Mitra approve/reject rekomendasi
- Tracking status pekerjaan napi

## 📱 UI/UX Features

- **Responsive Design**: Mobile-first approach
- **Dark Mode**: Toggle tema gelap/terang
- **Real-time Updates**: Supabase real-time subscriptions
- **Form Validation**: Zod schema validation
- **Toast Notifications**: Feedback user yang jelas
- **Loading States**: Skeleton loading & spinners
- **Error Handling**: Graceful error boundaries

## 🔒 Security

- **Authentication**: Supabase Auth dengan email/password
- **Authorization**: Role-based access control (RLS)
- **Data Validation**: Client & server-side validation
- **SQL Injection**: Protected dengan Supabase RLS
- **XSS Protection**: React built-in protections

## 📊 Performance

- **Code Splitting**: Route-based lazy loading
- **Image Optimization**: WebP format dengan fallback
- **Bundle Analysis**: Webpack bundle analyzer
- **Caching**: Browser & Supabase caching
- **CDN**: Static assets via CDN

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
# Deploy ke Vercel
```

### Manual Build
```bash
npm run build
# Upload folder dist/ ke web server
```

### Environment Variables untuk Production
```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
```

## 🛠️ Development

### Available Scripts
```bash
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # ESLint check
```

### Project Structure
```
src/
├── components/
│   ├── Admin/          # Admin components
│   ├── Mitra/          # Mitra components
│   ├── Auth/           # Authentication
│   ├── Layout/         # Layout components
│   └── UI/             # Reusable UI components
├── hooks/              # Custom React hooks
├── lib/                # Utilities & config
│   ├── supabase.ts     # Supabase client & types
│   ├── utils.ts        # Helper functions
│   └── pdfGenerator.ts # PDF generation
└── main.tsx           # App entry point
```

## 🐛 Troubleshooting

### Common Issues:

1. **Supabase Connection Error**
   - Periksa URL dan API key di `.env`
   - Pastikan RLS policies sudah diaktifkan

2. **Build Errors**
   - Jalankan `npm install` ulang
   - Clear node_modules dan package-lock.json

3. **Permission Denied**
   - Periksa RLS policies di Supabase
   - Pastikan user sudah login dengan role yang benar

## 📈 Roadmap

- [ ] Mobile app dengan React Native
- [ ] Sistem notifikasi push
- [ ] Integration dengan API pemerintah
- [ ] Advanced analytics & reporting
- [ ] Multi-language support
- [ ] Export data ke Excel/CSV
- [ ] Backup & restore system

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

Untuk bantuan teknis, silakan hubungi:
- Email: support@lapas.go.id
- WhatsApp: +62812-3456-7890

---

**Dibuat dengan ❤️ untuk kemajuan sistem pemasyarakatan Indonesia**
"# coba" 
