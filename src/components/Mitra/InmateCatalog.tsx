import React, { useState } from 'react';
import { Search, Filter, Eye, Download, Star, MapPin, Calendar } from 'lucide-react';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { Badge } from '../UI/Badge';
import { Modal } from '../UI/Modal';
import { useInmates } from '../../hooks/useSupabase';

interface InmateDetailModalProps {
  inmate: any;
  isOpen: boolean;
  onClose: () => void;
  onRecommend: (inmateId: string) => void;
}

const InmateDetailModal: React.FC<InmateDetailModalProps> = ({
  inmate,
  isOpen,
  onClose,
  onRecommend
}) => {
  if (!inmate) return null;

  const downloadResume = () => {
    // Implementasi download resume PDF
    console.log('Download resume for:', inmate.name);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail Narapidana">
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Lengkap
            </label>
            <p className="text-gray-900">{inmate.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nomor Registrasi
            </label>
            <p className="text-gray-900">{inmate.registration_number}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Umur
            </label>
            <p className="text-gray-900">{inmate.age} tahun</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <Badge variant={inmate.status === 'aktif' ? 'success' : 'default'}>
              {inmate.status === 'aktif' ? 'Aktif' : 'Tidak Aktif'}
            </Badge>
          </div>
        </div>

        {/* Skills & Performance */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Keahlian & Keterampilan
            </label>
            <div className="flex flex-wrap gap-2">
              {inmate.skills?.map((skill: string, index: number) => (
                <Badge key={index} variant="outline">
                  {skill}
                </Badge>
              )) || <span className="text-gray-500">Belum ada data</span>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating Performa
            </label>
            <div className="flex items-center space-x-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= (inmate.performance_rating || 0)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                ({inmate.performance_rating || 0}/5)
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Program yang Diikuti
            </label>
            <p className="text-gray-900">{inmate.programs_joined || 'Belum ada program'}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4 border-t">
          <Button
            onClick={downloadResume}
            variant="outline"
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Resume
          </Button>
          <Button
            onClick={() => onRecommend(inmate.id)}
            className="flex-1"
          >
            Ajukan Rekomendasi
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export const InmateCatalog: React.FC = () => {
  const { inmates, loading } = useInmates();
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [selectedInmate, setSelectedInmate] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Filter inmates based on search and filters
  const filteredInmates = inmates?.filter(inmate => {
    const matchesSearch = inmate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inmate.registration_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSkill = !skillFilter || 
      inmate.skills?.some((skill: string) => skill.toLowerCase().includes(skillFilter.toLowerCase()));
    
    const matchesRating = !ratingFilter || 
      (inmate.performance_rating >= parseInt(ratingFilter));

    return matchesSearch && matchesSkill && matchesRating;
  }) || [];

  const handleViewDetail = (inmate: any) => {
    setSelectedInmate(inmate);
    setIsDetailModalOpen(true);
  };

  const handleRecommend = (inmateId: string) => {
    // Implementasi ajukan rekomendasi
    console.log('Recommend inmate:', inmateId);
    setIsDetailModalOpen(false);
  };

  // Get unique skills for filter
  const availableSkills = Array.from(
    new Set(
      inmates?.flatMap(inmate => inmate.skills || []) || []
    )
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Katalog Narapidana</h1>
          <p className="text-gray-600 mt-1">
            Cari dan lihat profil narapidana yang tersedia untuk program kerja sama
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama atau nomor registrasi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Keahlian</option>
            {availableSkills.map((skill, index) => (
              <option key={index} value={skill}>{skill}</option>
            ))}
          </select>

          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Rating</option>
            <option value="4">4+ Bintang</option>
            <option value="3">3+ Bintang</option>
            <option value="2">2+ Bintang</option>
          </select>

          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter Lanjut
          </Button>
        </div>
      </Card>

      {/* Inmates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInmates.map((inmate) => (
          <Card key={inmate.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {inmate.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {inmate.registration_number}
                  </p>
                </div>
                <Badge variant={inmate.status === 'aktif' ? 'success' : 'default'}>
                  {inmate.status === 'aktif' ? 'Aktif' : 'Tidak Aktif'}
                </Badge>
              </div>

              {/* Basic Info */}
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  {inmate.age} tahun
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  Blok {inmate.block || '-'}
                </div>
              </div>

              {/* Performance Rating */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Performa:</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= (inmate.performance_rating || 0)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  ({inmate.performance_rating || 0}/5)
                </span>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Keahlian
                </label>
                <div className="flex flex-wrap gap-1">
                  {inmate.skills?.slice(0, 3).map((skill: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  )) || (
                    <span className="text-sm text-gray-500">Belum ada data</span>
                  )}
                  {inmate.skills?.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{inmate.skills.length - 3} lainnya
                    </Badge>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <Button
                onClick={() => handleViewDetail(inmate)}
                variant="outline"
                className="w-full"
              >
                <Eye className="w-4 h-4 mr-2" />
                Lihat Detail
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredInmates.length === 0 && (
        <Card className="p-12 text-center">
          <div className="text-gray-400 mb-4">
            <Search className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Tidak ada narapidana ditemukan
          </h3>
          <p className="text-gray-600">
            Coba ubah filter pencarian atau kriteria yang Anda gunakan
          </p>
        </Card>
      )}

      {/* Detail Modal */}
      <InmateDetailModal
        inmate={selectedInmate}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onRecommend={handleRecommend}
      />
    </div>
  );
};
