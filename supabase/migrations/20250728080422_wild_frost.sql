/*
  # Prison Management System Database Schema

  1. New Tables
    - `profiles` - User profiles with role-based access (admin_lapas, mitra)
    - `inmates` - Complete inmate data with personal information and status
    - `activities` - Prison activities and training programs
    - `activity_participants` - Junction table for inmate-activity relationships
    - `certifications` - Inmate certifications and achievements
    - `partners` - External partner organizations
    - `recommendations` - Inmate recommendations to partners
    - `reports` - Incident and progress reports
    - `attendance` - Daily attendance tracking
    - `activity_notes` - Notes from training instructors

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    - Separate admin and partner data access

  3. Features
    - Role-based authentication system
    - Complete inmate lifecycle management
    - Activity and certification tracking
    - Partner recommendation workflow
    - Reporting and analytics support
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin_lapas', 'mitra');
CREATE TYPE inmate_status AS ENUM ('aktif', 'nonaktif', 'bermasalah', 'dropout');
CREATE TYPE recommendation_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE activity_status AS ENUM ('planned', 'ongoing', 'completed', 'cancelled');
CREATE TYPE attendance_status AS ENUM ('hadir', 'tidak_hadir', 'izin', 'sakit');
CREATE TYPE note_type AS ENUM ('positif', 'negatif', 'normal');

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role user_role NOT NULL DEFAULT 'admin_lapas',
  phone text,
  organization text,
  is_demo boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create inmates table
CREATE TABLE IF NOT EXISTS inmates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  nik text UNIQUE NOT NULL,
  birth_date date NOT NULL,
  birth_place text NOT NULL,
  gender text NOT NULL CHECK (gender IN ('Laki-laki', 'Perempuan')),
  address text NOT NULL,
  phone text,
  emergency_contact text,
  prison_class text NOT NULL,
  entry_date date NOT NULL,
  status inmate_status DEFAULT 'aktif',
  photo_url text,
  notes text,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  start_date date NOT NULL,
  end_date date,
  max_participants integer DEFAULT 20,
  instructor_name text,
  location text,
  status activity_status DEFAULT 'planned',
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create activity_participants table
CREATE TABLE IF NOT EXISTS activity_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid REFERENCES activities(id) ON DELETE CASCADE,
  inmate_id uuid REFERENCES inmates(id) ON DELETE CASCADE,
  enrollment_date timestamptz DEFAULT now(),
  completion_date timestamptz,
  final_score integer CHECK (final_score >= 0 AND final_score <= 100),
  status inmate_status DEFAULT 'aktif',
  created_at timestamptz DEFAULT now(),
  UNIQUE(activity_id, inmate_id)
);

-- Create certifications table
CREATE TABLE IF NOT EXISTS certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inmate_id uuid REFERENCES inmates(id) ON DELETE CASCADE,
  partner_id uuid REFERENCES partners(id) ON DELETE CASCADE,
  recommended_by uuid REFERENCES profiles(id),
  status recommendation_status DEFAULT 'pending',
  recommendation_text text,
  partner_feedback text,
  approved_at timestamptz,
  rejected_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid REFERENCES activities(id) ON DELETE CASCADE,
  inmate_id uuid REFERENCES inmates(id) ON DELETE CASCADE,
  date date NOT NULL,
  status attendance_status DEFAULT 'hadir',
  notes text,
  recorded_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(activity_id, inmate_id, date)
);

-- Create activity_notes table
CREATE TABLE IF NOT EXISTS activity_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid REFERENCES activities(id) ON DELETE CASCADE,
  inmate_id uuid REFERENCES inmates(id) ON DELETE CASCADE,
  note_type note_type DEFAULT 'normal',
  content text NOT NULL,
  instructor_name text,
  date date DEFAULT CURRENT_DATE,
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
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admin can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin_lapas'
    )
  );

-- Inmates policies - Admin only
CREATE POLICY "Admin can manage inmates"
  ON inmates FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin_lapas'
    )
  );

CREATE POLICY "Partners can read recommended inmates"
  ON inmates FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN recommendations r ON r.partner_id IN (
        SELECT id FROM partners WHERE profile_id = p.id
      )
      WHERE p.user_id = auth.uid() AND p.role = 'mitra' AND r.inmate_id = inmates.id
    )
  );

-- Activities policies - Admin only
CREATE POLICY "Admin can manage activities"
  ON activities FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin_lapas'
    )
  );

-- Activity participants policies - Admin only
CREATE POLICY "Admin can manage activity participants"
  ON activity_participants FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin_lapas'
    )
  );

-- Certifications policies - Admin only
CREATE POLICY "Admin can manage certifications"
  ON certifications FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin_lapas'
    )
  );

-- Partners policies
CREATE POLICY "Partners can read own data"
  ON partners FOR SELECT
  TO authenticated
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admin can read all partners"
  ON partners FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin_lapas'
    )
  );

CREATE POLICY "Admin can manage partners"
  ON partners FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin_lapas'
    )
  );

-- Recommendations policies
CREATE POLICY "Admin can manage recommendations"
  ON recommendations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin_lapas'
    )
  );

CREATE POLICY "Partners can read own recommendations"
  ON recommendations FOR SELECT
  TO authenticated
  USING (
    partner_id IN (
      SELECT p.id FROM partners p
      JOIN profiles pr ON pr.id = p.profile_id
      WHERE pr.user_id = auth.uid()
    )
  );

CREATE POLICY "Partners can update own recommendations"
  ON recommendations FOR UPDATE
  TO authenticated
  USING (
    partner_id IN (
      SELECT p.id FROM partners p
      JOIN profiles pr ON pr.id = p.profile_id
      WHERE pr.user_id = auth.uid()
    )
  );

-- Reports policies
CREATE POLICY "Admin can manage reports"
  ON reports FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin_lapas'
    )
  );

CREATE POLICY "Partners can create reports"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'mitra'
    )
  );

-- Attendance policies - Admin only
CREATE POLICY "Admin can manage attendance"
  ON attendance FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin_lapas'
    )
  );

-- Activity notes policies - Admin only
CREATE POLICY "Admin can manage activity notes"
  ON activity_notes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin_lapas'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_inmates_status ON inmates(status);
CREATE INDEX IF NOT EXISTS idx_inmates_nik ON inmates(nik);
CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
CREATE INDEX IF NOT EXISTS idx_activity_participants_activity_id ON activity_participants(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_participants_inmate_id ON activity_participants(inmate_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_status ON recommendations(status);
CREATE INDEX IF NOT EXISTS idx_recommendations_partner_id ON recommendations(partner_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_inmate_id ON recommendations(inmate_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at);

-- Insert demo data
INSERT INTO profiles (user_id, email, full_name, role, phone, organization, is_demo) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@lapas.demo', 'Admin Lapas Demo', 'admin_lapas', '081234567890', 'Lapas Kelas I Jakarta', true),
  ('00000000-0000-0000-0000-000000000002', 'mitra@company.demo', 'Mitra Demo', 'mitra', '081987654321', 'PT. Teknologi Maju', true);

INSERT INTO partners (profile_id, company_name, industry, contact_person, email, phone, address, description) VALUES
  ((SELECT id FROM profiles WHERE email = 'mitra@company.demo'), 'PT. Teknologi Maju', 'Teknologi Informasi', 'Budi Santoso', 'mitra@company.demo', '081987654321', 'Jakarta Selatan', 'Perusahaan teknologi yang fokus pada pengembangan software');

-- Insert sample inmates
INSERT INTO inmates (name, nik, birth_date, birth_place, gender, address, phone, prison_class, entry_date, status) VALUES
  ('Ahmad Rizki', '3201012345678901', '1990-05-15', 'Jakarta', 'Laki-laki', 'Jl. Sudirman No. 123, Jakarta', '081234567890', 'Kelas IIA', '2023-01-15', 'aktif'),
  ('Sari Indah', '3201012345678902', '1988-08-22', 'Bandung', 'Perempuan', 'Jl. Asia Afrika No. 456, Bandung', '081234567891', 'Kelas IIB', '2023-02-20', 'aktif'),
  ('Budi Santoso', '3201012345678903', '1985-12-10', 'Surabaya', 'Laki-laki', 'Jl. Tunjungan No. 789, Surabaya', '081234567892', 'Kelas IIA', '2023-03-10', 'bermasalah');

-- Insert sample activities
INSERT INTO activities (title, description, start_date, end_date, max_participants, instructor_name, location, status) VALUES
  ('Pelatihan Komputer Dasar', 'Pelatihan komputer untuk pemula meliputi MS Office dan internet', '2024-01-15', '2024-03-15', 20, 'Drs. Agus Wibowo', 'Lab Komputer', 'completed'),
  ('Pelatihan Las Listrik', 'Pelatihan keterampilan las listrik untuk industri', '2024-02-01', '2024-04-01', 15, 'H. Sutrisno', 'Bengkel Praktik', 'ongoing'),
  ('Keterampilan Menjahit', 'Pelatihan menjahit dan bordir untuk wanita', '2024-03-01', '2024-05-01', 25, 'Ibu Siti Nurhaliza', 'Ruang Keterampilan', 'ongoing');

-- Insert activity participants
INSERT INTO activity_participants (activity_id, inmate_id, final_score, status) VALUES
  ((SELECT id FROM activities WHERE title = 'Pelatihan Komputer Dasar'), (SELECT id FROM inmates WHERE name = 'Ahmad Rizki'), 85, 'aktif'),
  ((SELECT id FROM activities WHERE title = 'Pelatihan Komputer Dasar'), (SELECT id FROM inmates WHERE name = 'Sari Indah'), 92, 'aktif'),
  ((SELECT id FROM activities WHERE title = 'Pelatihan Las Listrik'), (SELECT id FROM inmates WHERE name = 'Ahmad Rizki'), NULL, 'aktif'),
  ((SELECT id FROM activities WHERE title = 'Keterampilan Menjahit'), (SELECT id FROM inmates WHERE name = 'Sari Indah'), NULL, 'aktif');

-- Insert certifications
INSERT INTO certifications (inmate_id, title, issuer, issue_date, activity_id) VALUES
  ((SELECT id FROM inmates WHERE name = 'Ahmad Rizki'), 'Sertifikat Komputer Dasar', 'Lapas Kelas I Jakarta', '2024-03-20', (SELECT id FROM activities WHERE title = 'Pelatihan Komputer Dasar')),
  ((SELECT id FROM inmates WHERE name = 'Sari Indah'), 'Sertifikat Komputer Dasar', 'Lapas Kelas I Jakarta', '2024-03-20', (SELECT id FROM activities WHERE title = 'Pelatihan Komputer Dasar'));

-- Insert sample recommendations
INSERT INTO recommendations (inmate_id, partner_id, recommended_by, status, recommendation_text) VALUES
  ((SELECT id FROM inmates WHERE name = 'Ahmad Rizki'), (SELECT id FROM partners WHERE company_name = 'PT. Teknologi Maju'), (SELECT id FROM profiles WHERE email = 'admin@lapas.demo'), 'pending', 'Napi berprestasi dengan kemampuan komputer yang baik'),
  ((SELECT id FROM inmates WHERE name = 'Sari Indah'), (SELECT id FROM partners WHERE company_name = 'PT. Teknologi Maju'), (SELECT id FROM profiles WHERE email = 'admin@lapas.demo'), 'pending', 'Napi dengan keterampilan menjahit dan komputer yang excellent');