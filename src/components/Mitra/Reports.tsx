import React, { useState } from 'react';
import { FileText, Download, Filter, TrendingUp, Users, Activity } from 'lucide-react';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { Badge } from '../UI/Badge';
import { useRecommendations, useDashboardStats } from '../../hooks/useSupabase';

export const Reports: React.FC = () => {
  const { recommendations } = useRecommendations();
  const { stats } = useDashboardStats();
  const [dateRange, setDateRange] = useState('month');
  const [reportType, setReportType] = useState('all');

  // Calculate metrics
  const totalRecommendations = recommendations?.length || 0;
  const approvedRecommendations = recommendations?.filter(r => r.status === 'approved').length || 0;
  const pendingRecommendations = recommendations?.filter(r => r.status === 'pending').length || 0;
  const rejectedRecommendations = recommendations?.filter(r => r.status === 'rejected').length || 0;
  
  const approvalRate = totalRecommendations > 0 ? (approvedRecommendations / totalRecommendations * 100).toFixed(1) : 0;

  const generateReport = (type: string) => {
    console.log('Generating report:', type);
    // Implementasi generate laporan PDF
  };

  const exportData = () => {
    console.log('Exporting data');
    // Implementasi export data
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan & Analisis</h1>
          <p className="text-gray-600 mt-1">
            Lihat ringkasan aktivitas dan performa kerja sama dengan Lapas
          </p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={exportData} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button onClick={() => generateReport('comprehensive')}>
            <FileText className="w-4 h-4 mr-2" />
            Generate Laporan
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Periode Laporan
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">7 Hari Terakhir</option>
              <option value="month">30 Hari Terakhir</option>
              <option value="quarter">3 Bulan Terakhir</option>
              <option value="year">1 Tahun Terakhir</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenis Laporan
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Aktivitas</option>
              <option value="recommendations">Rekomendasi</option>
              <option value="inmates">Data Narapidana</option>
              <option value="performance">Analisis Performa</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button variant="outline" className="w-full">
              <Filter className="w-4 h-4 mr-2" />
              Filter Lanjut
            </Button>
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Rekomendasi</p>
              <p className="text-2xl font-bold text-gray-900">{totalRecommendations}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-green-600 text-sm font-medium">
              +12% dari bulan lalu
            </span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tingkat Persetujuan</p>
              <p className="text-2xl font-bold text-gray-900">{approvalRate}%</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-green-600 text-sm font-medium">
              +5% dari bulan lalu
            </span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Napi Direkomendasikan</p>
              <p className="text-2xl font-bold text-gray-900">{approvedRecommendations}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-green-600 text-sm font-medium">
              +8% dari bulan lalu
            </span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Program Aktif</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalActivities || 0}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Activity className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-green-600 text-sm font-medium">
              +15% dari bulan lalu
            </span>
          </div>
        </Card>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recommendation Status Overview */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Status Rekomendasi
            </h3>
            <Button
              onClick={() => generateReport('recommendations')}
              variant="outline"
              size="sm"
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium text-gray-900">Disetujui</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-gray-900">{approvedRecommendations}</span>
                <Badge variant="success">
                  {totalRecommendations > 0 ? Math.round(approvedRecommendations / totalRecommendations * 100) : 0}%
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="font-medium text-gray-900">Menunggu</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-gray-900">{pendingRecommendations}</span>
                <Badge variant="warning">
                  {totalRecommendations > 0 ? Math.round(pendingRecommendations / totalRecommendations * 100) : 0}%
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="font-medium text-gray-900">Ditolak</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-gray-900">{rejectedRecommendations}</span>
                <Badge variant="danger">
                  {totalRecommendations > 0 ? Math.round(rejectedRecommendations / totalRecommendations * 100) : 0}%
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Recent Recommendations */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Rekomendasi Terbaru
            </h3>
            <Button variant="outline" size="sm">
              Lihat Semua
            </Button>
          </div>
          
          <div className="space-y-3">
            {recommendations?.slice(0, 5).map((rec) => (
              <div key={rec.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    Rekomendasi #{rec.id.slice(0, 8)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(rec.created_at).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <Badge
                  variant={
                    rec.status === 'approved' ? 'success' :
                    rec.status === 'pending' ? 'warning' : 'danger'
                  }
                >
                  {rec.status === 'approved' ? 'Disetujui' :
                   rec.status === 'pending' ? 'Menunggu' : 'Ditolak'}
                </Badge>
              </div>
            )) || (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Belum ada rekomendasi</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Available Reports */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Laporan yang Tersedia
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
               onClick={() => generateReport('monthly')}>
            <div className="flex items-center justify-between mb-3">
              <FileText className="w-8 h-8 text-blue-600" />
              <Badge variant="primary">Bulanan</Badge>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">
              Laporan Bulanan
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              Ringkasan aktivitas dan pencapaian dalam sebulan terakhir
            </p>
            <Button variant="outline" size="sm" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>

          <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
               onClick={() => generateReport('performance')}>
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <Badge variant="success">Performa</Badge>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">
              Analisis Performa
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              Evaluasi tingkat keberhasilan dan efektivitas program
            </p>
            <Button variant="outline" size="sm" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>

          <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
               onClick={() => generateReport('inmates')}>
            <div className="flex items-center justify-between mb-3">
              <Users className="w-8 h-8 text-purple-600" />
              <Badge variant="secondary">Data Napi</Badge>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">
              Data Narapidana
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              Profil lengkap dan progress narapidana yang direkomendasikan
            </p>
            <Button variant="outline" size="sm" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
