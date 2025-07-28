import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LoginForm from './components/Auth/LoginForm';
import Layout from './components/Layout/Layout';

// Admin Components  
import Dashboard from './components/Admin/Dashboard';
import Activities from './components/Admin/Activities';
import Inmates from './components/Admin/Inmates';

// Mitra Components
import MitraDashboard from './components/Mitra/Dashboard';

// Simple auth state for testing
function useSimpleAuth() {
  // For testing, return demo data
  return {
    user: { id: 'demo', email: 'demo@test.com' },
    profile: { role: 'admin_lapas', full_name: 'Demo User', is_demo: true },
    loading: false
  };
}

function App() {
  const { user, profile, loading } = useSimpleAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
            <Route path="/dashboard" element={profile.role === 'admin_lapas' ? <Dashboard /> : <MitraDashboard />} />
            
            {profile.role === 'admin_lapas' && (
              <>
                <Route path="/activities" element={<Activities />} />
                <Route path="/inmates" element={<Inmates />} />
              </>
            )}
            
            {profile.role === 'mitra' && (
              <>
                <Route path="/inmates" element={<div className="p-8">Katalog Napi - Coming Soon</div>} />
                <Route path="/partners" element={<div className="p-8">Katalog Mitra - Coming Soon</div>} />
                <Route path="/reports" element={<div className="p-8">Laporan - Coming Soon</div>} />
                <Route path="/contact" element={<div className="p-8">Kontak - Coming Soon</div>} />
              </>
            )}
            
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </Router>
      <Toaster position="top-right" />
    </>
  );
}

export default App;
