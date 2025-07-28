-- Demo data for profiles
INSERT INTO profiles (user_id, email, full_name, role, organization, is_demo) VALUES 
  ('demo-admin-uuid', 'admin@lapas.demo', 'Admin Lapas Demo', 'admin_lapas', 'Lembaga Pemasyarakatan Jakarta Timur', true),
  ('demo-mitra-uuid', 'mitra@company.demo', 'PT Mitra Demo', 'mitra', 'PT Mitra Sejahtera Indonesia', true);

-- Demo data for inmates
INSERT INTO inmates (name, nik, birth_date, birth_place, gender, address, prison_class, entry_date, status, registration_number, age, block, skills, performance_rating, programs_joined) VALUES 
  ('Ahmad Budiman', '3171010101900001', '1990-01-01', 'Jakarta', 'L', 'Jl. Kebon Jeruk No. 123, Jakarta Barat', 'IIA', '2023-01-15', 'aktif', 'NP-2023-001', 34, 'A1', '["Menjahit", "Quality Control"]'::jsonb, 4, 'Program Pelatihan Jahit'),
  ('Budi Santoso', '3171010201850002', '1985-02-01', 'Jakarta', 'L', 'Jl. Mangga Dua No. 456, Jakarta Utara', 'IIA', '2023-02-20', 'aktif', 'NP-2023-002', 39, 'A2', '["Pertukangan Kayu", "Finishing"]'::jsonb, 5, 'Program Pelatihan Furniture'),
  ('Sari Wulandari', '3171010301920003', '1992-03-01', 'Jakarta', 'P', 'Jl. Raya Bekasi No. 789, Jakarta Timur', 'IIA', '2023-03-10', 'aktif', 'NP-2023-003', 32, 'B1', '["Bertani", "Hidroponik"]'::jsonb, 4, 'Program Agrikultur'),
  ('Eko Prasetyo', '3171010401880004', '1988-04-01', 'Jakarta', 'L', 'Jl. Sudirman No. 321, Jakarta Selatan', 'IIA', '2023-04-05', 'aktif', 'NP-2023-004', 36, 'A3', '["Packaging", "Quality Control"]'::jsonb, 3, 'Program Manufaktur'),
  ('Rita Sari', '3171010501950005', '1995-05-01', 'Jakarta', 'P', 'Jl. Thamrin No. 654, Jakarta Pusat', 'IIA', '2023-05-12', 'aktif', 'NP-2023-005', 29, 'B2', '["Design", "Finishing"]'::jsonb, 4, 'Program Kerajinan');

-- Demo data for activities
INSERT INTO activities (title, description, start_date, end_date, max_participants, instructor_name, location, category, status) VALUES 
  ('Pelatihan Menjahit Dasar', 'Program pelatihan menjahit untuk pemula dengan fokus pada teknik dasar dan kualitas jahitan', '2024-01-15', '2024-03-15', 20, 'Ibu Siti Rahayu', 'Ruang Pelatihan A', 'Ketrampilan', 'aktif'),
  ('Workshop Pertukangan Kayu', 'Pelatihan pertukangan kayu mulai dari dasar hingga finishing furniture', '2024-02-01', '2024-04-01', 15, 'Pak Joko Santoso', 'Workshop B', 'Ketrampilan', 'aktif'),
  ('Program Agrikultur Modern', 'Pelatihan bertani modern dengan sistem hidroponik dan organik', '2024-03-01', '2024-05-01', 25, 'Dr. Agus Permana', 'Greenhouse C', 'Agrikultur', 'aktif'),
  ('Pelatihan Quality Control', 'Program pelatihan kontrol kualitas produk untuk industri manufaktur', '2024-01-20', '2024-03-20', 18, 'Ir. Bambang Wijaya', 'Lab QC', 'Industri', 'selesai'),
  ('Kelas Desain Produk', 'Pelatihan desain produk kreatif dan inovatif untuk UMKM', '2024-02-15', '2024-04-15', 12, 'Drs. Creative Team', 'Studio Design', 'Kreatif', 'aktif');

-- Demo data for recommendations  
INSERT INTO recommendations (inmate_id, recommended_by, status, notes, recommendation_letter) VALUES 
  ((SELECT id FROM inmates WHERE name = 'Ahmad Budiman'), 'demo-mitra-uuid', 'pending', 'Narapidana dengan keahlian menjahit yang baik, cocok untuk industri garmen', 'Rekomendasi untuk program pelatihan lanjutan di bidang tekstil'),
  ((SELECT id FROM inmates WHERE name = 'Budi Santoso'), 'demo-mitra-uuid', 'approved', 'Sangat terampil dalam pertukangan kayu, telah menyelesaikan beberapa proyek furniture', 'Direkomendasikan untuk kerja sama dengan industri furniture'),
  ((SELECT id FROM inmates WHERE name = 'Sari Wulandari'), 'demo-mitra-uuid', 'pending', 'Memiliki minat tinggi di bidang pertanian modern', 'Cocok untuk program agrikultur berkelanjutan');
