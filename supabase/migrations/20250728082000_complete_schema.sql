-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('admin_lapas', 'mitra')) NOT NULL,
    phone VARCHAR(20),
    organization VARCHAR(255),
    is_demo BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inmates table
CREATE TABLE IF NOT EXISTS inmates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    nik VARCHAR(20) UNIQUE NOT NULL,
    birth_date DATE NOT NULL,
    birth_place VARCHAR(255) NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('Laki-laki', 'Perempuan')) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20),
    emergency_contact VARCHAR(255),
    prison_class VARCHAR(50) NOT NULL,
    entry_date DATE NOT NULL,
    status VARCHAR(20) CHECK (status IN ('aktif', 'nonaktif', 'bermasalah', 'dropout')) DEFAULT 'aktif',
    photo_url TEXT,
    notes TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    max_participants INTEGER DEFAULT 20,
    instructor_name VARCHAR(255),
    location VARCHAR(255),
    status VARCHAR(20) CHECK (status IN ('planned', 'ongoing', 'completed', 'cancelled')) DEFAULT 'planned',
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activity participants table
CREATE TABLE IF NOT EXISTS activity_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
    inmate_id UUID REFERENCES inmates(id) ON DELETE CASCADE,
    enrollment_date DATE DEFAULT CURRENT_DATE,
    completion_date DATE,
    final_score DECIMAL(5,2),
    status VARCHAR(20) CHECK (status IN ('aktif', 'nonaktif', 'bermasalah', 'dropout')) DEFAULT 'aktif',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(activity_id, inmate_id)
);

-- Create certifications table
CREATE TABLE IF NOT EXISTS certifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inmate_id UUID REFERENCES inmates(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    issuer VARCHAR(255) NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE,
    certificate_url TEXT,
    activity_id UUID REFERENCES activities(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create partners table
CREATE TABLE IF NOT EXISTS partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id),
    company_name VARCHAR(255) NOT NULL,
    industry VARCHAR(255),
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    website VARCHAR(255),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recommendations table
CREATE TABLE IF NOT EXISTS recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inmate_id UUID REFERENCES inmates(id) ON DELETE CASCADE,
    partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
    recommended_by UUID REFERENCES profiles(id),
    status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    recommendation_text TEXT,
    partner_feedback TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    rejected_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inmate_id UUID REFERENCES inmates(id) ON DELETE CASCADE,
    reported_by UUID REFERENCES profiles(id),
    report_type VARCHAR(20) CHECK (report_type IN ('dropout', 'bermasalah', 'progress', 'incident')) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    action_taken TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
    inmate_id UUID REFERENCES inmates(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(20) CHECK (status IN ('hadir', 'tidak_hadir', 'izin', 'sakit')) NOT NULL,
    notes TEXT,
    recorded_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(activity_id, inmate_id, date)
);

-- Create activity notes table
CREATE TABLE IF NOT EXISTS activity_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
    inmate_id UUID REFERENCES inmates(id) ON DELETE CASCADE,
    note_type VARCHAR(20) CHECK (note_type IN ('positif', 'negatif', 'normal')) DEFAULT 'normal',
    content TEXT NOT NULL,
    instructor_name VARCHAR(255),
    date DATE DEFAULT CURRENT_DATE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inmates_status ON inmates(status);
CREATE INDEX IF NOT EXISTS idx_inmates_created_at ON inmates(created_at);
CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
CREATE INDEX IF NOT EXISTS idx_activities_start_date ON activities(start_date);
CREATE INDEX IF NOT EXISTS idx_activity_participants_status ON activity_participants(status);
CREATE INDEX IF NOT EXISTS idx_recommendations_status ON recommendations(status);
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(report_type);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);

-- Create RLS policies
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

-- Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);

-- Policies for inmates (admin only)
CREATE POLICY "Admin can manage inmates" ON inmates FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin_lapas')
);
CREATE POLICY "Mitra can view inmates" ON inmates FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin_lapas', 'mitra'))
);

-- Policies for activities (admin only)
CREATE POLICY "Admin can manage activities" ON activities FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin_lapas')
);

-- Policies for activity_participants (admin only)
CREATE POLICY "Admin can manage participants" ON activity_participants FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin_lapas')
);

-- Policies for certifications
CREATE POLICY "Admin can manage certifications" ON certifications FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin_lapas')
);
CREATE POLICY "Mitra can view certifications" ON certifications FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin_lapas', 'mitra'))
);

-- Policies for partners
CREATE POLICY "Admin can manage partners" ON partners FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin_lapas')
);
CREATE POLICY "Mitra can view own partner" ON partners FOR SELECT USING (
    profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- Policies for recommendations
CREATE POLICY "Admin can manage recommendations" ON recommendations FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin_lapas')
);
CREATE POLICY "Mitra can view own recommendations" ON recommendations FOR SELECT USING (
    partner_id IN (SELECT id FROM partners WHERE profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid()))
);
CREATE POLICY "Mitra can update own recommendations" ON recommendations FOR UPDATE USING (
    partner_id IN (SELECT id FROM partners WHERE profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid()))
);

-- Policies for reports
CREATE POLICY "Users can manage reports" ON reports FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin_lapas', 'mitra'))
);

-- Policies for attendance (admin only)
CREATE POLICY "Admin can manage attendance" ON attendance FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin_lapas')
);

-- Policies for activity_notes (admin only)
CREATE POLICY "Admin can manage activity notes" ON activity_notes FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin_lapas')
);

-- Function to automatically update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inmates_updated_at BEFORE UPDATE ON inmates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON partners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recommendations_updated_at BEFORE UPDATE ON recommendations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO profiles (user_id, email, full_name, role, phone, organization) VALUES
    ('11111111-1111-1111-1111-111111111111', 'admin@lapas.go.id', 'Admin Lapas', 'admin_lapas', '081234567890', 'Lembaga Pemasyarakatan'),
    ('22222222-2222-2222-2222-222222222222', 'mitra@perusahaan.com', 'PT Mitra Sejahtera', 'mitra', '081234567891', 'PT Mitra Sejahtera')
ON CONFLICT (email) DO NOTHING;
