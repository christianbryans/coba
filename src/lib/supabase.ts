import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Using demo mode.');
}

// Create Supabase client
export const supabase = createClient(
  supabaseUrl || 'https://demo.supabase.co',
  supabaseAnonKey || 'demo-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

export type UserRole = 'admin_lapas' | 'mitra';

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  organization?: string;
  is_demo?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Inmate {
  id: string;
  name: string;
  nik: string;
  birth_date: string;
  birth_place: string;
  gender: string;
  address: string;
  phone?: string;
  emergency_contact?: string;
  prison_class: string;
  entry_date: string;
  status: 'aktif' | 'nonaktif' | 'bermasalah' | 'dropout';
  photo_url?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Additional computed fields for display
  registration_number?: string;
  age?: number;
  block?: string;
  skills?: string[];
  performance_rating?: number;
  programs_joined?: string;
}

export interface Activity {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  max_participants: number;
  instructor_name?: string;
  location?: string;
  status: 'planned' | 'ongoing' | 'completed' | 'cancelled';
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityParticipant {
  id: string;
  activity_id: string;
  inmate_id: string;
  enrollment_date: string;
  completion_date?: string;
  final_score?: number;
  status: 'aktif' | 'nonaktif' | 'bermasalah' | 'dropout';
  created_at: string;
  activity?: Activity;
  inmate?: Inmate;
}

export interface Certification {
  id: string;
  inmate_id: string;
  title: string;
  issuer: string;
  issue_date: string;
  expiry_date?: string;
  certificate_url?: string;
  activity_id?: string;
  created_at: string;
  activity?: Activity;
}

export interface Partner {
  id: string;
  profile_id?: string;
  company_name: string;
  industry?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Recommendation {
  id: string;
  inmate_id: string;
  partner_id: string;
  recommended_by?: string;
  status: 'pending' | 'approved' | 'rejected';
  recommendation_text?: string;
  partner_feedback?: string;
  approved_at?: string;
  rejected_at?: string;
  created_at: string;
  updated_at: string;
  inmate?: Inmate;
  partner?: Partner;
  recommender?: Profile;
}

export interface Report {
  id: string;
  inmate_id: string;
  reported_by?: string;
  report_type: 'dropout' | 'bermasalah' | 'progress' | 'incident';
  title: string;
  description: string;
  action_taken?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
  inmate?: Inmate;
  reporter?: Profile;
}

export interface Attendance {
  id: string;
  activity_id: string;
  inmate_id: string;
  date: string;
  status: 'hadir' | 'tidak_hadir' | 'izin' | 'sakit';
  notes?: string;
  recorded_by?: string;
  created_at: string;
  activity?: Activity;
  inmate?: Inmate;
}

export interface ActivityNote {
  id: string;
  activity_id: string;
  inmate_id: string;
  note_type: 'positif' | 'negatif' | 'normal';
  content: string;
  instructor_name?: string;
  date: string;
  created_by?: string;
  created_at: string;
  activity?: Activity;
  inmate?: Inmate;
}