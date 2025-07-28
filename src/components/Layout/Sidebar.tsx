import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Building2, 
  FileText, 
  UserCheck,
  LogOut
} from 'lucide-react';

// Simple profile for testing
const useSimpleProfile = () => ({
  profile: { 
    role: 'admin_lapas', 
    full_name: 'Demo User', 
    is_demo: true 
  },
  signOut: () => console.log('Sign out')
});

const Sidebar = () => {
  const { profile, signOut } = useSimpleProfile();

  const adminMenus = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Calendar, label: 'Kegiatan', path: '/activities' },
    { icon: Users, label: 'Data Napi', path: '/inmates' },
  ];

  const mitraMenus = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Katalog Napi', path: '/inmates' },
    { icon: Building2, label: 'Katalog Mitra', path: '/partners' },
    { icon: FileText, label: 'Laporan', path: '/reports' },
    { icon: UserCheck, label: 'Hubungi Lapas', path: '/contact' },
  ];

  const menus = profile?.role === 'admin_lapas' ? adminMenus : mitraMenus;

  const handleSignOut = () => {
    signOut();
  };

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 h-screen fixed left-0 top-0 z-30">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">
          {profile?.role === 'admin_lapas' ? 'Admin Lapas' : 'Mitra Portal'}
        </h1>
        <p className="text-sm text-gray-600 mt-1">{profile?.full_name}</p>
        {profile?.is_demo && (
          <span className="inline-block px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full mt-2">
            Demo Account
          </span>
        )}
      </div>

      <nav className="p-4 space-y-2">
        {menus.map((menu) => {
          const Icon = menu.icon;
          return (
            <NavLink
              key={menu.path}
              to={menu.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{menu.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <button
          onClick={handleSignOut}
          className="flex items-center space-x-3 px-4 py-3 w-full text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Keluar</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
