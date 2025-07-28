import React, { useState, useEffect } from 'react';
import { User, Calendar, MapPin, Phone, Edit, FileText, Award } from 'lucide-react';
import { Button } from '../UI/Button';
import { Badge } from '../UI/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../UI/Card';
import { Table, TableHead, TableBody, TableRow, TableCell } from '../UI/Table';
import { Inmate, ActivityParticipant, Certification } from '../../lib/supabase';
import { supabase } from '../../lib/supabase';
import { formatDate, getStatusColor, getStatusText, calculateAge } from '../../lib/utils';
import { generateInmateResume } from '../../lib/pdfGenerator';

interface InmateDetailProps {
  inmate: Inmate;
  onClose: () => void;
  onEdit: (inmate: Inmate) => void;
}

const InmateDetail: React.FC<InmateDetailProps> = ({ inmate, onClose, onEdit }) => {
  const [activities, setActivities] = useState<ActivityParticipant[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInmateData();
  }, [inmate.id]);

  const fetchInmateData = async () => {
    try {
      setLoading(true);
      
      // Fetch activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activity_participants')
        .select(`
          *,
          activity:activities(*)
        `)
        .eq('inmate_id', inmate.id)
        .order('enrollment_date', { ascending: false });

      if (activitiesError) throw activitiesError;

      // Fetch certifications
      const { data: certificationsData, error: certificationsError } = await supabase
        .from('certifications')
        .select(`
          *,
          activity:activities(*)
        `)
        .eq('inmate_id', inmate.id)
        .order('issue_date', { ascending: false });

      if (certificationsError) throw certificationsError;

      setActivities(activitiesData || []);
      setCertifications(certificationsData || []);
    } catch (error) {
      console.error('Error fetching inmate data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintResume = async () => {
    await generateInmateResume(inmate, activities, certifications);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-gray-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{inmate.name}</h2>
            <p className="text-gray-600">{inmate.nik}</p>
            <Badge className={getStatusColor(inmate.status)}>
              {getStatusText(inmate.status)}
            </Badge>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="secondary" onClick={() => onEdit(inmate)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Data
          </Button>
          <Button onClick={handlePrintResume}>
            <FileText className="w-4 h-4 mr-2" />
            Cetak Resume
          </Button>
        </div>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Pribadi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Tempat, Tanggal Lahir</p>
                  <p className="font-medium">{inmate.birth_place}, {formatDate(inmate.birth_date)}</p>
                  <p className="text-sm text-gray-500">Umur: {calculateAge(inmate.birth_date)} tahun</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Jenis Kelamin</p>
                  <p className="font-medium">{inmate.gender}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Alamat</p>
                  <p className="font-medium">{inmate.address}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">No. Telepon</p>
                  <p className="font-medium">{inmate.phone || '-'}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Kontak Darurat</p>
                  <p className="font-medium">{inmate.emergency_contact || '-'}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Tanggal Masuk</p>
                  <p className="font-medium">{formatDate(inmate.entry_date)}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Kelas Tahanan</p>
              <p className="font-medium">{inmate.prison_class}</p>
            </div>
            
            {inmate.notes && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-1">Catatan</p>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{inmate.notes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Riwayat Kegiatan ({activities.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : activities.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Belum ada riwayat kegiatan</p>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell isHeader>Kegiatan</TableCell>
                  <TableCell isHeader>Tanggal Daftar</TableCell>
                  <TableCell isHeader>Status</TableCell>
                  <TableCell isHeader>Nilai</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{activity.activity?.title}</p>
                        <p className="text-sm text-gray-500">{activity.activity?.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(activity.enrollment_date)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(activity.status)}>
                        {getStatusText(activity.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {activity.final_score ? (
                        <span className="font-medium">{activity.final_score}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Certifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="w-5 h-5 mr-2" />
            Sertifikasi ({certifications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : certifications.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Belum ada sertifikasi</p>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell isHeader>Nama Sertifikat</TableCell>
                  <TableCell isHeader>Penerbit</TableCell>
                  <TableCell isHeader>Tanggal Terbit</TableCell>
                  <TableCell isHeader>Masa Berlaku</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {certifications.map((cert) => (
                  <TableRow key={cert.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{cert.title}</p>
                        {cert.activity && (
                          <p className="text-sm text-gray-500">Dari: {cert.activity.title}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{cert.issuer}</TableCell>
                    <TableCell>{formatDate(cert.issue_date)}</TableCell>
                    <TableCell>
                      {cert.expiry_date ? formatDate(cert.expiry_date) : 'Seumur hidup'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="secondary" onClick={onClose}>
          Tutup
        </Button>
      </div>
    </div>
  );
};

export default InmateDetail;
