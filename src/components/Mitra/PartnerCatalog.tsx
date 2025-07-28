import React, { useState } from 'react';
import { Search, Filter, Building, MapPin, Phone, Mail, Globe, Users, Star } from 'lucide-react';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { Badge } from '../UI/Badge';
import { Modal } from '../UI/Modal';

// Mock data untuk mitra (dalam implementasi nyata akan dari Supabase)
const mockPartners = [
  {
    id: '1',
    name: 'PT Garment Indonesia',
    type: 'Manufaktur',
    category: 'Tekstil & Garmen',
    location: 'Jakarta Utara',
    phone: '+62-21-12345678',
    email: 'contact@garmentindo.com',
    website: 'www.garmentindo.com',
    rating: 4.5,
    totalProjects: 12,
    activeProjects: 3,
    description: 'Perusahaan manufaktur tekstil terkemuka yang berkomitmen memberikan pelatihan kerja untuk narapidana.',
    skills_needed: ['Menjahit', 'Quality Control', 'Packaging'],
    status: 'active'
  },
  {
    id: '2',
    name: 'CV Berkah Furniture',
    type: 'UMKM',
    category: 'Furniture & Kerajinan',
    location: 'Jepara',
    phone: '+62-291-987654',
    email: 'info@berkahfurniture.co.id',
    website: 'www.berkahfurniture.co.id',
    rating: 4.8,
    totalProjects: 8,
    activeProjects: 2,
    description: 'Pengrajin furniture kayu berkualitas dengan pengalaman mengembangkan skill narapidana.',
    skills_needed: ['Pertukangan Kayu', 'Finishing', 'Design'],
    status: 'active'
  },
  {
    id: '3',
    name: 'UD Sari Tani',
    type: 'Koperasi',
    category: 'Pertanian & Agrikultur',
    location: 'Bandung',
    phone: '+62-22-345678',
    email: 'admin@saritani.coop',
    website: 'www.saritani.coop',
    rating: 4.2,
    totalProjects: 15,
    activeProjects: 5,
    description: 'Koperasi petani yang fokus pada pemberdayaan masyarakat melalui program pertanian organik.',
    skills_needed: ['Bertani', 'Hidroponik', 'Pengolahan Hasil Tani'],
    status: 'active'
  }
];

interface PartnerDetailModalProps {
  partner: any;
  isOpen: boolean;
  onClose: () => void;
  onContact: (partnerId: string) => void;
}

const PartnerDetailModal: React.FC<PartnerDetailModalProps> = ({
  partner,
  isOpen,
  onClose,
  onContact
}) => {
  if (!partner) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail Mitra">
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Perusahaan
            </label>
            <p className="text-gray-900">{partner.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jenis Usaha
            </label>
            <p className="text-gray-900">{partner.type}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kategori
            </label>
            <p className="text-gray-900">{partner.category}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lokasi
            </label>
            <p className="text-gray-900">{partner.location}</p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900">Informasi Kontak</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-gray-500" />
              <span className="text-gray-900">{partner.phone}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-gray-500" />
              <span className="text-gray-900">{partner.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-gray-500" />
              <span className="text-gray-900">{partner.website}</span>
            </div>
          </div>
        </div>

        {/* Skills Needed */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Keahlian yang Dibutuhkan
          </label>
          <div className="flex flex-wrap gap-2">
            {partner.skills_needed?.map((skill: string, index: number) => (
              <Badge key={index} variant="outline">
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        {/* Performance */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{partner.totalProjects}</p>
            <p className="text-sm text-gray-600">Total Proyek</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{partner.activeProjects}</p>
            <p className="text-sm text-gray-600">Proyek Aktif</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              <span className="text-2xl font-bold text-gray-900">{partner.rating}</span>
            </div>
            <p className="text-sm text-gray-600">Rating</p>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Deskripsi
          </label>
          <p className="text-gray-900">{partner.description}</p>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t">
          <Button
            onClick={() => onContact(partner.id)}
            className="w-full"
          >
            <Mail className="w-4 h-4 mr-2" />
            Hubungi Mitra
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export const PartnerCatalog: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Filter partners based on search and filters
  const filteredPartners = mockPartners.filter(partner => {
    const matchesSearch = partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !categoryFilter || partner.category === categoryFilter;
    const matchesType = !typeFilter || partner.type === typeFilter;
    const matchesLocation = !locationFilter || partner.location.includes(locationFilter);

    return matchesSearch && matchesCategory && matchesType && matchesLocation;
  });

  const handleViewDetail = (partner: any) => {
    setSelectedPartner(partner);
    setIsDetailModalOpen(true);
  };

  const handleContact = (partnerId: string) => {
    console.log('Contact partner:', partnerId);
    setIsDetailModalOpen(false);
    // Implementasi hubungi mitra
  };

  // Get unique values for filters
  const categories = Array.from(new Set(mockPartners.map(p => p.category)));
  const types = Array.from(new Set(mockPartners.map(p => p.type)));
  const locations = Array.from(new Set(mockPartners.map(p => p.location)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Katalog Mitra</h1>
          <p className="text-gray-600 mt-1">
            Jelajahi mitra kerja sama yang tersedia untuk program narapidana
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama atau kategori..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Kategori</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Jenis</option>
            {types.map((type, index) => (
              <option key={index} value={type}>{type}</option>
            ))}
          </select>

          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Lokasi</option>
            {locations.map((location, index) => (
              <option key={index} value={location}>{location}</option>
            ))}
          </select>

          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter Lanjut
          </Button>
        </div>
      </Card>

      {/* Partners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPartners.map((partner) => (
          <Card key={partner.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {partner.name}
                    </h3>
                    <p className="text-sm text-gray-600">{partner.type}</p>
                  </div>
                </div>
                <Badge variant="success">Aktif</Badge>
              </div>

              {/* Category & Location */}
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Building className="w-4 h-4 mr-2" />
                  {partner.category}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  {partner.location}
                </div>
              </div>

              {/* Rating & Projects */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium text-gray-900">
                    {partner.rating}
                  </span>
                  <span className="text-sm text-gray-600">
                    ({partner.totalProjects} proyek)
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {partner.activeProjects} aktif
                  </span>
                </div>
              </div>

              {/* Skills Needed */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Keahlian Dibutuhkan
                </label>
                <div className="flex flex-wrap gap-1">
                  {partner.skills_needed.slice(0, 2).map((skill: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {partner.skills_needed.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{partner.skills_needed.length - 2} lainnya
                    </Badge>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 line-clamp-2">
                {partner.description}
              </p>

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-2">
                <Button
                  onClick={() => handleViewDetail(partner)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  Lihat Detail
                </Button>
                <Button
                  onClick={() => handleContact(partner.id)}
                  size="sm"
                  className="flex-1"
                >
                  <Mail className="w-4 h-4 mr-1" />
                  Hubungi
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredPartners.length === 0 && (
        <Card className="p-12 text-center">
          <div className="text-gray-400 mb-4">
            <Building className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Tidak ada mitra ditemukan
          </h3>
          <p className="text-gray-600">
            Coba ubah filter pencarian atau kriteria yang Anda gunakan
          </p>
        </Card>
      )}

      {/* Detail Modal */}
      <PartnerDetailModal
        partner={selectedPartner}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onContact={handleContact}
      />
    </div>
  );
};
