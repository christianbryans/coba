/*
  # Prison Management System Database Schema

  1. New Tables
    - `profiles` - User profiles with roles (admin_lapas, mitra)
    - `inmates` - Inmate records with personal information
    - `activities` - Training/work activities
    - `activity_participants` - Many-to-many relationship between inmates and activities
    - `certifications` - Certificates earned by inmates
    - `partners` - Partner companies/organizations
    - `recommendations` - Inmate recommendations to partners
    - `reports` - Incident and progress reports
    - `attendance` - Daily attendance records
    - `activity_notes` - Notes from instructors about inmates

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    - Demo accounts for testing

  3. Sample Data
    - Demo profiles for admin and mitra roles
    - Sample inmates, activities, and partners for testing
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin_lapas', 'mitra')),
  phone text,
  organization text,
  is_demo boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create inmates table
CREATE TABLE IF NOT EXISTS inmates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  nik text UNIQUE NOT NULL,
  birth_date date NOT NULL,
  birth_place text NOT NULL,
  gender text NOT NULL CHECK (gender IN ('L', 'P')),
  address text NOT NULL,
  phone text,
  emergency_contact text,
  prison_class text NOT NULL,
  entry_date date NOT NULL,
  status text NOT NULL DEFAULT 'aktif' CHECK (status IN ('aktif', 'nonaktif', 'bermasalah', 'dropout')),
  photo_url text,
  notes text,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  start_date date NOT NULL,
  end_date date,
  max_participants integer NOT NULL DEFAULT 20,
  instructor_name text,
  location text,
  status text NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'ongoing', 'completed', 'cancelled')),
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create activity_participants table
CREATE TABLE IF NOT EXISTS activity_participants (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_id uuid REFERENCES activities(id) ON DELETE CASCADE,
  inmate_id uuid REFERENCES inmates(id) ON DELETE CASCADE,
  enrollment_date date NOT NULL DEFAULT CURRENT_DATE,
  completion_date date,
  final_score numeric(5,2),
  status text NOT NULL DEFAULT 'aktif' CHECK (status IN ('aktif', 'nonaktif', 'bermasalah', 'dropout')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(activity_id, inmate_id)
);

-- Create certifications table
CREATE TABLE IF NOT EXISTS certifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  inmate_id uuid REFERENCES inmates(id) ON DELETE CASCADE,
  title text NOT NULL,
  issuer text NOT NULL,
  issue_date date NOT NULL,
  expiry_date date,
  certificate_url text,
  activity_id uuid REFERENCES activities(id),
  created_at timestamptz DEFAULT now()
);

-- Create partners table
CREATE TABLE IF NOT EXISTS partners (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id uuid REFERENCES profiles(id),
  company_name text NOT NULL,
  industry text,
  contact_person text,
  email text,
  phone text,
  address text,
  website text,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create recommendations table
CREATE TABLE IF NOT EXISTS recommendations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  inmate_id uuid REFERENCES inmates(id) ON DELETE CASCADE,
  partner_id uuid REFERENCES partners(id) ON DELETE CASCADE,
  recommended_by uuid REFERENCES profiles(id),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  recommendation_text text,
  partner_feedback text,
  approved_at timestamptz,
  rejected_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  inmate_id uuid REFERENCES inmates(id) ON DELETE CASCADE,
  reported_by uuid REFERENCES profiles(id),
  report_type text NOT NULL CHECK (report_type IN ('dropout', 'bermasalah', 'progress', 'incident')),
  title text NOT NULL,
  description text NOT NULL,
  action_taken text,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_id uuid REFERENCES activities(id) ON DELETE CASCADE,
  inmate_id uuid REFERENCES inmates(id) ON DELETE CASCADE,
  date date NOT NULL,
  status text NOT NULL CHECK (status IN ('hadir', 'tidak_hadir', 'izin', 'sakit')),
  notes text,
  recorded_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(activity_id, inmate_id, date)
);

-- Create activity_notes table
CREATE TABLE IF NOT EXISTS activity_notes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_id uuid REFERENCES activities(id) ON DELETE CASCADE,
  inmate_id uuid REFERENCES inmates(id) ON DELETE CASCADE,
  note_type text NOT NULL CHECK (note_type IN ('positif', 'negatif', 'normal')),
  content text NOT NULL,
  instructor_name text,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE inmates ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_notes ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Profiles policies
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id OR is_demo = true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Inmates policies (admin_lapas can manage, mitra can read)
CREATE POLICY "Admin can manage inmates" ON inmates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin_lapas'
    )
  );

CREATE POLICY "Mitra can read inmates" ON inmates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role IN ('admin_lapas', 'mitra')
    )
  );

-- Activities policies
CREATE POLICY "Admin can manage activities" ON activities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin_lapas'
    )
  );

CREATE POLICY "Mitra can read activities" ON activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role IN ('admin_lapas', 'mitra')
    )
  );

-- Activity participants policies
CREATE POLICY "Admin can manage participants" ON activity_participants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin_lapas'
    )
  );

CREATE POLICY "Mitra can read participants" ON activity_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role IN ('admin_lapas', 'mitra')
    )
  );

-- Certifications policies
CREATE POLICY "Admin can manage certifications" ON certifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin_lapas'
    )
  );

CREATE POLICY "Mitra can read certifications" ON certifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role IN ('admin_lapas', 'mitra')
    )
  );

-- Partners policies
CREATE POLICY "Admin can read all partners" ON partners
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin_lapas'
    )
  );

CREATE POLICY "Mitra can manage own partner" ON partners
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.id = partners.profile_id
    )
  );

-- Recommendations policies
CREATE POLICY "Admin can manage recommendations" ON recommendations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin_lapas'
    )
  );

CREATE POLICY "Mitra can read own recommendations" ON recommendations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN partners pt ON pt.profile_id = p.id
      WHERE p.user_id = auth.uid() 
      AND pt.id = recommendations.partner_id
    )
  );

CREATE POLICY "Mitra can update own recommendations" ON recommendations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN partners pt ON pt.profile_id = p.id
      WHERE p.user_id = auth.uid() 
      AND pt.id = recommendations.partner_id
    )
  );

-- Reports policies
CREATE POLICY "Admin can manage reports" ON reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin_lapas'
    )
  );

CREATE POLICY "Mitra can create reports" ON reports
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'mitra'
    )
  );

-- Attendance policies
CREATE POLICY "Admin can manage attendance" ON attendance
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin_lapas'
    )
  );

-- Activity notes policies
CREATE POLICY "Admin can manage activity notes" ON activity_notes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin_lapas'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_inmates_status ON inmates(status);
CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
CREATE INDEX IF NOT EXISTS idx_activity_participants_activity_id ON activity_participants(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_participants_inmate_id ON activity_participants(inmate_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_status ON recommendations(status);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);

-- Insert demo data
INSERT INTO profiles (id, user_id, email, full_name, role, phone, organization, is_demo) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'admin@lapas.demo', 'Admin Lapas Demo', 'admin_lapas', '081234567890', 'Lapas Kelas IIA Jakarta', true),
  ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'mitra@company.demo', 'Mitra Company Demo', 'mitra', '081234567891', 'PT. Mitra Sejahtera', true)
ON CONFLICT (email) DO NOTHING;

-- Insert sample inmates
INSERT INTO inmates (id, name, nik, birth_date, birth_place, gender, address, phone, prison_class, entry_date, status, created_by) VALUES
  ('660e8400-e29b-41d4-a716-446655440001', 'Ahmad Santoso', '3201234567890001', '1990-05-15', 'Jakarta', 'L', 'Jl. Merdeka No. 123, Jakarta', '081234567892', 'IIA', '2023-01-15', 'aktif', '550e8400-e29b-41d4-a716-446655440001'),
  ('660e8400-e29b-41d4-a716-446655440002', 'Budi Prasetyo', '3201234567890002', '1988-08-20', 'Bandung', 'L', 'Jl. Sudirman No. 456, Bandung', '081234567893', 'IIA', '2023-02-10', 'aktif', '550e8400-e29b-41d4-a716-446655440001'),
  ('660e8400-e29b-41d4-a716-446655440003', 'Siti Nurhaliza', '3201234567890003', '1992-12-03', 'Surabaya', 'P', 'Jl. Pahlawan No. 789, Surabaya', '081234567894', 'IIA', '2023-03-05', 'aktif', '550e8400-e29b-41d4-a716-446655440001')
ON CONFLICT (nik) DO NOTHING;

-- Insert sample activities
INSERT INTO activities (id, title, description, start_date, end_date, max_participants, instructor_name, location, status, created_by) VALUES
  ('770e8400-e29b-41d4-a716-446655440001', 'Pelatihan Komputer Dasar', 'Pelatihan penggunaan komputer dan Microsoft Office', '2024-01-15', '2024-03-15', 20, 'Pak Joko', 'Lab Komputer', 'ongoing', '550e8400-e29b-41d4-a716-446655440001'),
  ('770e8400-e29b-41d4-a716-446655440002', 'Keterampilan Las Listrik', 'Pelatihan pengelasan untuk industri', '2024-02-01', '2024-04-01', 15, 'Pak Budi', 'Workshop', 'ongoing', '550e8400-e29b-41d4-a716-446655440001'),
  ('770e8400-e29b-41d4-a716-446655440003', 'Tata Boga', 'Pelatihan memasak dan manajemen dapur', '2024-01-20', '2024-03-20', 25, 'Bu Sari', 'Dapur Pelatihan', 'completed', '550e8400-e29b-41d4-a716-446655440001')
ON CONFLICT (id) DO NOTHING;

-- Insert sample partners
INSERT INTO partners (id, profile_id, company_name, industry, contact_person, email, phone, address, description, is_active) VALUES
  ('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'PT. Teknologi Maju', 'Teknologi Informasi', 'John Doe', 'john@teknologimaju.com', '021-12345678', 'Jl. Gatot Subroto No. 100, Jakarta', 'Perusahaan teknologi yang membutuhkan tenaga kerja IT', true),
  ('880e8400-e29b-41d4-a716-446655440002', null, 'CV. Bengkel Sejahtera', 'Manufaktur', 'Jane Smith', 'jane@bengkelsejahtera.com', '021-87654321', 'Jl. Industri No. 50, Bekasi', 'Bengkel yang membutuhkan tukang las berpengalaman', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample activity participants
INSERT INTO activity_participants (activity_id, inmate_id, enrollment_date, status) VALUES
  ('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '2024-01-15', 'aktif'),
  ('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', '2024-01-15', 'aktif'),
  ('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', '2024-02-01', 'aktif'),
  ('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440003', '2024-01-20', 'aktif')
ON CONFLICT (activity_id, inmate_id) DO NOTHING;

-- Insert sample certifications
INSERT INTO certifications (inmate_id, title, issuer, issue_date, activity_id) VALUES
  ('660e8400-e29b-41d4-a716-446655440003', 'Sertifikat Tata Boga Dasar', 'Lapas Kelas IIA Jakarta', '2024-03-20', '770e8400-e29b-41d4-a716-446655440003')
ON CONFLICT (id) DO NOTHING;

-- Insert sample recommendations
INSERT INTO recommendations (inmate_id, partner_id, recommended_by, status, recommendation_text) VALUES
  ('660e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'pending', 'Napi dengan kemampuan komputer yang baik, cocok untuk posisi entry level IT'),
  ('660e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'approved', 'Napi dengan keterampilan las yang sangat baik, sudah menyelesaikan pelatihan dengan nilai memuaskan')
ON CONFLICT (id) DO NOTHING;