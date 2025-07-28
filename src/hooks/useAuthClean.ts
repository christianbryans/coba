import { useEffect, useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';
import toast from 'react-hot-toast';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        setProfile(null);
      } else if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create demo profile
        const demoProfile: Profile = {
          id: 'demo-profile',
          user_id: userId,
          email: 'demo@test.com',
          full_name: 'Demo User',
          role: 'admin_lapas',
          is_demo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setProfile(demoProfile);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (error) {
          console.error('Session error:', error);
          setLoading(false);
          return;
        }

        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error getting session:', error);
        if (mounted) setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        if (!mounted) return;

        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return { data: null, error };
      }

      toast.success('Berhasil masuk!');
      return { data, error: null };
    } catch (error: any) {
      toast.error('Terjadi kesalahan saat login');
      return { data: null, error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: 'admin_lapas' | 'mitra') => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return { data: null, error };
      }

      if (data.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: data.user.id,
            email,
            full_name: fullName,
            role,
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }
      }

      toast.success('Akun berhasil dibuat!');
      return { data, error: null };
    } catch (error: any) {
      toast.error('Terjadi kesalahan saat mendaftar');
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Berhasil keluar');
      }
      return { error };
    } catch (error: any) {
      toast.error('Terjadi kesalahan saat keluar');
      return { error };
    }
  };

  const signInDemo = async (role: 'admin_lapas' | 'mitra') => {
    try {
      // For demo purposes, create mock session
      const demoUserId = `demo-${role}-${Date.now()}`;
      const demoProfile: Profile = {
        id: `profile-${demoUserId}`,
        user_id: demoUserId,
        email: role === 'admin_lapas' ? 'admin@lapas.demo' : 'mitra@company.demo',
        full_name: role === 'admin_lapas' ? 'Admin Lapas Demo' : 'Mitra Demo',
        role,
        is_demo: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const demoUser: User = {
        id: demoUserId,
        email: demoProfile.email,
        aud: 'authenticated',
        role: 'authenticated',
        email_confirmed_at: new Date().toISOString(),
        phone: '',
        confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: {},
        identities: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setUser(demoUser);
      setProfile(demoProfile);
      setLoading(false);

      toast.success(`Masuk sebagai ${role === 'admin_lapas' ? 'Admin Lapas' : 'Mitra'} Demo`);
      return { data: { user: demoUser }, error: null };
    } catch (error: any) {
      toast.error('Gagal masuk demo');
      return { data: null, error };
    }
  };

  return {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    signInDemo,
  };
}
