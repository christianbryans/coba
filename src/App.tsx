import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LoginForm from './components/Auth/LoginForm';
import Layout from './components/Layout/Layout';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

// Admin Components  
import Dashboard from './components/Admin/Dashboard';
import Activities from './components/Admin/Activities';
import Inmates from './components/Admin/Inmates';

// Mitra Components
import MitraDashboard from './components/Mitra/Dashboard';
import { InmateCatalog } from './components/Mitra/InmateCatalog';
import { PartnerCatalog } from './components/Mitra/PartnerCatalog';
import { Reports } from './components/Mitra/Reports';
import { Contact } from './components/Mitra/Contact';

// Simple Auth State Management for Demo
function useSimpleAuth() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Create demo authenticated user
        const demoUser = {
          id: '11111111-1111-1111-1111-111111111111',
          email: 'admin@lapas.demo',
          aud: 'authenticated',
          role: 'authenticated',
          email_confirmed_at: new Date().toISOString(),
          phone: '',
          confirmed_at: new Date().toISOString(),
          last_sign_in_at: new Date().toISOString(),
          app_metadata: { provider: 'demo' },
          user_metadata: { full_name: 'Admin Lapas Demo' },
          identities: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const demoProfile = {
          id: '11111111-1111-1111-1111-111111111111',
          user_id: '11111111-1111-1111-1111-111111111111',
          email: 'admin@lapas.demo',
          full_name: 'Admin Lapas Demo',
          role: 'admin_lapas',
          is_demo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        // Override Supabase auth methods for demo
        const mockSession = {
          access_token: 'demo-access-token',
          refresh_token: 'demo-refresh-token',
          expires_in: 3600,
          token_type: 'bearer',
          user: demoUser
        };

        // Set session for Supabase client
        (supabase.auth as any)._session = mockSession;
        
        // Override getUser method
        supabase.auth.getUser = async () => ({
          data: { user: demoUser },
          error: null
        });

        setUser(demoUser);
        setProfile(demoProfile);
        
        console.log('✅ Demo authentication setup complete');
      } catch (error) {
        console.error('❌ Demo auth setup failed:', error);
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  return { user, profile, loading };
}

function App() {
  const { user, profile, loading } = useSimpleAuth();

  // Debug logging
  useEffect(() => {
    console.log('App state:', { user: !!user, profile: !!profile, loading });
  }, [user, profile, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat aplikasi...</p>
          <p className="mt-2 text-sm text-gray-500">Menginisialisasi koneksi database</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <>
        <LoginForm />
        <Toaster position="top-right" />
      </>
    );
  }

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route 
              path="/dashboard" 
              element={
                profile.role === 'admin_lapas' ? <Dashboard /> : <MitraDashboard />
              } 
            />
            
            {/* Admin Routes - Full CRUD Access */}
            {profile.role === 'admin_lapas' && (
              <>
                <Route path="/activities" element={<Activities />} />
                <Route path="/inmates" element={<Inmates />} />
              </>
            )}
            
            {/* Mitra Routes - Read-only and Partner-specific CRUD */}
            {profile.role === 'mitra' && (
              <>
                <Route path="/inmates" element={<InmateCatalog />} />
                <Route path="/partners" element={<PartnerCatalog />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/contact" element={<Contact />} />
              </>
            )}
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  );
}

export default App;
