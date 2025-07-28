import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  Clock, 
  FileText,
  Eye,
  Check,
  X,
  Star
} from 'lucide-react';
import { supabase, Recommendation, Inmate } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

const MitraDashboard = () => {
  const { profile } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [selectedInmate, setSelectedInmate] = useState<Inmate | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });

  useEffect(() => {
    if (profile) {
      fetchRecommendations();
    }
  }, [profile]);

  const fetchRecommendations = async () => {
    try {
      // Get partner ID first
      const { data: partner } = await supabase
        .from('partners')
        .select('id')
        .eq('profile_id', profile?.id)
        .single();

      if (!partner) return;

      const { data, error } = await supabase
        .from('recommendations')
        .select(`
          *,
          inmate:inmates(*),
          partner:partners(*),
          recommender:profiles(*)
        `)
        .eq('partner_id', partner.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRecommendations(data || []);
      
      // Calculate stats
      const pending = data?.filter(r => r.status === 'pending').length || 0;
      const approved = data?.filter(r => r.status === 'approved').length || 0;
      const rejected = data?.filter(r => r.status === 'rejected').length || 0;
      
      setStats({
        pending,
        approved,
        rejected,
        total: data?.length || 0
      });
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecommendationAction = async (recommendationId: string, status: 'approved' | 'rejected', feedback?: string) => {
    try {
      const updateData: any = {
        status,
        partner_feedback: feedback,
      };

      if (status === 'approved') {
        updateData.approved_at = new Date().toISOString();
      } else {
        updateData.rejected_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('recommendations')
        .update(updateData)
        .eq('id', recommendationId);

      if (error) throw error;

      await fetchRecommendations();
    } catch (error) {
      console.error('Error updating recommendation:', error);
    }
  };

  const viewInmateDetails = async (inmateId: string) => {
    try {
      const { data, error } = await supabase
        .from('inmates')
        .select(`
          *,
          activity_participants(
            *,
            activity:activities(*)
          ),
          certifications(
            *,
            activity:activities(*)
          )
        `)
        .eq('id', inmateId)
        .single();

      if (error) throw error;
      setSelectedInmate(data);
    } catch (error) {
      console.error('Error fetching inmate details:', error);
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Mitra</h1>
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
              <p className="text-sm text-gray-600">Total Rekomendasi</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Menunggu Review</p>
              <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Disetujui</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ditolak</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <X className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Rekomendasi Napi</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {recommendations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Belum ada rekomendasi napi
            </div>
          ) : (
            recommendations.map((recommendation) => (
              <div key={recommendation.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        {recommendation.inmate?.name}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        recommendation.status === 'pending' 
                          ? 'bg-orange-100 text-orange-800'
                          : recommendation.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {recommendation.status === 'pending' ? 'Menunggu' :
                         recommendation.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1">{recommendation.inmate?.prison_class}</p>
                    <p className="text-gray-800 mt-2">{recommendation.recommendation_text}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Direkomendasikan pada {new Date(recommendation.created_at).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => viewInmateDetails(recommendation.inmate_id)}
                      className="inline-flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Lihat Detail
                    </button>
                    {recommendation.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleRecommendationAction(recommendation.id, 'approved')}
                          className="inline-flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Setujui
                        </button>
                        <button
                          onClick={() => handleRecommendationAction(recommendation.id, 'rejected', 'Tidak sesuai kebutuhan')}
                          className="inline-flex items-center px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Tolak
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Inmate Details Modal */}
      {selectedInmate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Resume Napi</h2>
                <button
                  onClick={() => setSelectedInmate(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Personal Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Pribadi</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Nama:</span>
                    <p className="mt-1">{selectedInmate.name}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">NIK:</span>
                    <p className="mt-1">{selectedInmate.nik}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Tempat, Tanggal Lahir:</span>
                    <p className="mt-1">{selectedInmate.birth_place}, {new Date(selectedInmate.birth_date).toLocaleDateString('id-ID')}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Jenis Kelamin:</span>
                    <p className="mt-1">{selectedInmate.gender}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Kelas Tahanan:</span>
                    <p className="mt-1">{selectedInmate.prison_class}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Status:</span>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ml-1 ${
                      selectedInmate.status === 'aktif' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {selectedInmate.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Activities */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Riwayat Kegiatan</h3>
                <div className="space-y-3">
                  {(selectedInmate as any).activity_participants?.map((participant: any) => (
                    <div key={participant.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{participant.activity?.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{participant.activity?.description}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            Periode: {new Date(participant.activity?.start_date).toLocaleDateString('id-ID')} - 
                            {participant.activity?.end_date ? new Date(participant.activity.end_date).toLocaleDateString('id-ID') : 'Ongoing'}
                          </p>
                        </div>
                        {participant.final_score && (
                          <div className="text-right">
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-400 mr-1" />
                              <span className="font-medium">{participant.final_score}/100</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sertifikasi</h3>
                <div className="space-y-3">
                  {(selectedInmate as any).certifications?.map((cert: any) => (
                    <div key={cert.id} className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900">{cert.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">Penerbit: {cert.issuer}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Tanggal Terbit: {new Date(cert.issue_date).toLocaleDateString('id-ID')}
                        {cert.expiry_date && ` | Berlaku hingga: ${new Date(cert.expiry_date).toLocaleDateString('id-ID')}`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MitraDashboard;