import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Building2, 
  FileText, 
  UserCheck,
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = () => {
  const { profile, signOut } = useAuth();

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

  const handleSignOut = async () => {
    await signOut();
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
      
      <nav className="p-4 flex-1">
        <ul className="space-y-2">
          {menus.map((menu) => (
            <li key={menu.path}>
              <NavLink
                to={menu.path}
                className={({ isActive }) => `
                  flex items-center px-4 py-3 rounded-lg transition-colors duration-200
                  ${isActive 
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <menu.icon className="w-5 h-5 mr-3" />
                {menu.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleSignOut}
          className="flex items-center w-full px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors duration-200"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Keluar
        </button>
      </div>
    </div>
  );
};

export default Sidebar;