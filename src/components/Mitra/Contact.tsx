import React, { useState } from 'react';
import { Phone, Mail, MessageCircle, MapPin, Clock, Send, FileText, HeadphonesIcon } from 'lucide-react';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { Badge } from '../UI/Badge';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    priority: 'normal',
    category: 'general'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submit contact form:', formData);
    // Implementasi submit form
  };

  const handleWhatsApp = () => {
    // Nomor WhatsApp Lapas (contoh)
    const phoneNumber = '+6281234567890';
    const message = 'Halo, saya ingin menanyakan tentang program kerja sama dengan Lapas.';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCallHotline = () => {
    // Nomor hotline Lapas
    const phoneNumber = '021-12345678';
    window.open(`tel:${phoneNumber}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hubungi Lapas</h1>
          <p className="text-gray-600 mt-1">
            Dapatkan bantuan dan informasi lebih lanjut tentang program kerja sama
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Information */}
        <div className="lg:col-span-1 space-y-6">
          {/* Quick Contact */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Kontak Cepat
            </h3>
            
            <div className="space-y-4">
              <Button
                onClick={handleWhatsApp}
                variant="success"
                className="w-full justify-start"
              >
                <MessageCircle className="w-5 h-5 mr-3" />
                WhatsApp
                <Badge variant="success" className="ml-auto">
                  Online
                </Badge>
              </Button>

              <Button
                onClick={handleCallHotline}
                variant="primary"
                className="w-full justify-start"
              >
                <Phone className="w-5 h-5 mr-3" />
                Hotline 24/7
                <Badge variant="primary" className="ml-auto">
                  Aktif
                </Badge>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
              >
                <Mail className="w-5 h-5 mr-3" />
                Email Support
              </Button>
            </div>
          </Card>

          {/* Contact Details */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Informasi Kontak
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Telepon</p>
                  <p className="text-gray-600">021-12345678</p>
                  <p className="text-gray-600">021-87654321 (Fax)</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Email</p>
                  <p className="text-gray-600">info@lapas-jakarta.go.id</p>
                  <p className="text-gray-600">kerjasama@lapas-jakarta.go.id</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Alamat</p>
                  <p className="text-gray-600">
                    Jl. Raya Lapas No. 123<br />
                    Jakarta Timur 13640<br />
                    DKI Jakarta
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Jam Operasional</p>
                  <p className="text-gray-600">
                    Senin - Jumat: 08:00 - 17:00<br />
                    Sabtu: 08:00 - 12:00<br />
                    Minggu & Libur: Tutup
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* FAQ Quick Links */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Bantuan Cepat
            </h3>
            
            <div className="space-y-3">
              <Button variant="ghost" className="w-full justify-start text-left">
                <FileText className="w-4 h-4 mr-3" />
                <div>
                  <p className="font-medium">Syarat Kerja Sama</p>
                  <p className="text-sm text-gray-600">Panduan lengkap persyaratan</p>
                </div>
              </Button>

              <Button variant="ghost" className="w-full justify-start text-left">
                <HeadphonesIcon className="w-4 h-4 mr-3" />
                <div>
                  <p className="font-medium">Proses Seleksi</p>
                  <p className="text-sm text-gray-600">Tahapan seleksi narapidana</p>
                </div>
              </Button>

              <Button variant="ghost" className="w-full justify-start text-left">
                <MessageCircle className="w-4 h-4 mr-3" />
                <div>
                  <p className="font-medium">Program Tersedia</p>
                  <p className="text-sm text-gray-600">Daftar program kerja sama</p>
                </div>
              </Button>
            </div>
          </Card>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Kirim Pesan
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori Pertanyaan
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="general">Informasi Umum</option>
                    <option value="cooperation">Kerja Sama</option>
                    <option value="recommendation">Rekomendasi Napi</option>
                    <option value="program">Program Pelatihan</option>
                    <option value="technical">Bantuan Teknis</option>
                    <option value="complaint">Keluhan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prioritas
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Rendah</option>
                    <option value="normal">Normal</option>
                    <option value="high">Tinggi</option>
                    <option value="urgent">Mendesak</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subjek
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Masukkan subjek pesan Anda"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pesan
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Tulis pesan Anda di sini..."
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-gray-600">
                  <p>Respon dalam 1-2 hari kerja</p>
                  <p>Untuk urusan mendesak, gunakan WhatsApp atau hotline</p>
                </div>
                <Button type="submit">
                  <Send className="w-4 h-4 mr-2" />
                  Kirim Pesan
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>

      {/* Emergency Contact */}
      <Card className="p-6 bg-red-50 border-red-200">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-red-100 rounded-full">
            <Phone className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Kontak Darurat
            </h3>
            <p className="text-red-800 mb-3">
              Untuk situasi darurat atau mendesak yang memerlukan penanganan segera, 
              hubungi hotline darurat kami.
            </p>
            <div className="flex space-x-3">
              <Button 
                onClick={handleCallHotline}
                variant="danger"
                size="sm"
              >
                <Phone className="w-4 h-4 mr-2" />
                Hotline Darurat: 021-911
              </Button>
              <Button 
                onClick={handleWhatsApp}
                variant="outline"
                size="sm"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp: +62-812-3456-7890
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Status Tracking */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Lacak Status Pesan
        </h3>
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Masukkan nomor tiket (contoh: TKT-2024-001)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button variant="outline">
            Cek Status
          </Button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Nomor tiket akan dikirim ke email Anda setelah mengirim pesan
        </p>
      </Card>
    </div>
  );
};
