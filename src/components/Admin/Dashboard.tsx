import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  AlertTriangle, 
  TrendingUp,
  UserCheck,
  FileText,
  Clock,
  Award
} from 'lucide-react';
import { supabase, Inmate, Activity, Recommendation, Report } from '../../lib/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalInmates: 0,
    activeInmates: 0,
    problematicInmates: 0,
    activeActivities: 0,
    pendingRecommendations: 0,
    totalReports: 0
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [problematicInmates, setProblematicInmates] = useState<Inmate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch inmates statistics
      const { data: inmates } = await supabase
        .from('inmates')
        .select('*');

      // Fetch activities
      const { data: activitiesData } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch recommendations
      const { data: recommendations } = await supabase
        .from('recommendations')
        .select('*')
        .eq('status', 'pending');

      // Fetch reports
      const { data: reports } = await supabase
        .from('reports')
        .select('*');

      if (inmates) {
        const active = inmates.filter(i => i.status === 'aktif').length;
        const problematic = inmates.filter(i => i.status === 'bermasalah' || i.status === 'dropout');
        
        setStats({
          totalInmates: inmates.length,
          activeInmates: active,
          problematicInmates: problematic.length,
          activeActivities: activitiesData?.filter(a => a.status === 'ongoing').length || 0,
          pendingRecommendations: recommendations?.length || 0,
          totalReports: reports?.length || 0
        });

        setProblematicInmates(problematic);
      }

      if (activitiesData) {
        setActivities(activitiesData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    { month: 'Jan', napi: 45 },
    { month: 'Feb', napi: 52 },
    { month: 'Mar', napi: 48 },
    { month: 'Apr', napi: 61 },
    { month: 'Mei', napi: 58 },
    { month: 'Jun', napi: 67 },
  ];

  const pieData = [
    { name: 'Aktif', value: stats.activeInmates, color: '#10B981' },
    { name: 'Bermasalah', value: stats.problematicInmates, color: '#F59E0B' },
    { name: 'Non-aktif', value: stats.totalInmates - stats.activeInmates - stats.problematicInmates, color: '#6B7280' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('id-ID', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Napi</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalInmates}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Napi Aktif</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeInmates}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Perlu Intervensi</p>
              <p className="text-2xl font-bold text-orange-600">{stats.problematicInmates}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Kegiatan Aktif</p>
              <p className="text-2xl font-bold text-purple-600">{stats.activeActivities}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Progres Napi Bekerja</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="napi" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribusi Status Napi</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Problematic Inmates */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
            Napi Perlu Intervensi
          </h3>
          <div className="space-y-3">
            {problematicInmates.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Tidak ada napi yang perlu intervensi</p>
            ) : (
              problematicInmates.slice(0, 5).map((inmate) => (
                <div key={inmate.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{inmate.name}</p>
                    <p className="text-sm text-gray-600">{inmate.prison_class}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    inmate.status === 'bermasalah' 
                      ? 'bg-orange-100 text-orange-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {inmate.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 text-blue-500 mr-2" />
            Kegiatan Terbaru
          </h3>
          <div className="space-y-3">
            {activities.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Belum ada kegiatan</p>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-600">{activity.instructor_name}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    activity.status === 'ongoing' 
                      ? 'bg-green-100 text-green-800' 
                      : activity.status === 'completed'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {activity.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;