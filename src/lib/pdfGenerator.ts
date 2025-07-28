import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Inmate, ActivityParticipant, Certification } from './supabase';
import { formatDate, calculateAge } from './utils';

export const generateInmateResume = async (
  inmate: Inmate,
  activities: ActivityParticipant[],
  certifications: Certification[]
): Promise<void> => {
  // Create HTML content for PDF
  const content = document.createElement('div');
  content.style.padding = '40px';
  content.style.fontFamily = 'Arial, sans-serif';
  content.style.backgroundColor = 'white';
  content.style.width = '210mm';
  content.style.minHeight = '297mm';

  content.innerHTML = `
    <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0066cc; padding-bottom: 20px;">
      <h1 style="color: #0066cc; margin: 0; font-size: 24px;">RESUME NARAPIDANA</h1>
      <h2 style="color: #666; margin: 5px 0; font-size: 18px;">Lembaga Pemasyarakatan</h2>
      <p style="margin: 5px 0; color: #888; font-size: 12px;">Tanggal Cetak: ${formatDate(new Date())}</p>
    </div>

    <div style="margin-bottom: 30px;">
      <h3 style="color: #0066cc; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 15px;">DATA PRIBADI</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="width: 25%; padding: 8px 0; font-weight: bold;">Nama Lengkap</td>
          <td style="width: 5%; padding: 8px 0;">:</td>
          <td style="padding: 8px 0;">${inmate.name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">NIK</td>
          <td style="padding: 8px 0;">:</td>
          <td style="padding: 8px 0;">${inmate.nik}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Tempat, Tanggal Lahir</td>
          <td style="padding: 8px 0;">:</td>
          <td style="padding: 8px 0;">${inmate.birth_place}, ${formatDate(inmate.birth_date)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Umur</td>
          <td style="padding: 8px 0;">:</td>
          <td style="padding: 8px 0;">${calculateAge(inmate.birth_date)} tahun</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Jenis Kelamin</td>
          <td style="padding: 8px 0;">:</td>
          <td style="padding: 8px 0;">${inmate.gender}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Alamat</td>
          <td style="padding: 8px 0;">:</td>
          <td style="padding: 8px 0;">${inmate.address}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Kelas Tahanan</td>
          <td style="padding: 8px 0;">:</td>
          <td style="padding: 8px 0;">${inmate.prison_class}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Tanggal Masuk</td>
          <td style="padding: 8px 0;">:</td>
          <td style="padding: 8px 0;">${formatDate(inmate.entry_date)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Status</td>
          <td style="padding: 8px 0;">:</td>
          <td style="padding: 8px 0;">${inmate.status.toUpperCase()}</td>
        </tr>
      </table>
    </div>

    <div style="margin-bottom: 30px;">
      <h3 style="color: #0066cc; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 15px;">RIWAYAT KEGIATAN</h3>
      ${activities.length > 0 ? `
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold;">No</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold;">Nama Kegiatan</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold;">Tanggal</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold;">Status</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold;">Nilai</th>
            </tr>
          </thead>
          <tbody>
            ${activities.map((activity, index) => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 10px;">${index + 1}</td>
                <td style="border: 1px solid #ddd; padding: 10px;">${activity.activity?.title || '-'}</td>
                <td style="border: 1px solid #ddd; padding: 10px;">${formatDate(activity.enrollment_date)}</td>
                <td style="border: 1px solid #ddd; padding: 10px;">${activity.status.toUpperCase()}</td>
                <td style="border: 1px solid #ddd; padding: 10px;">${activity.final_score || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '<p style="color: #666; font-style: italic;">Belum ada riwayat kegiatan</p>'}
    </div>

    <div style="margin-bottom: 30px;">
      <h3 style="color: #0066cc; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 15px;">SERTIFIKASI</h3>
      ${certifications.length > 0 ? `
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold;">No</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold;">Nama Sertifikat</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold;">Penerbit</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold;">Tanggal Terbit</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold;">Masa Berlaku</th>
            </tr>
          </thead>
          <tbody>
            ${certifications.map((cert, index) => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 10px;">${index + 1}</td>
                <td style="border: 1px solid #ddd; padding: 10px;">${cert.title}</td>
                <td style="border: 1px solid #ddd; padding: 10px;">${cert.issuer}</td>
                <td style="border: 1px solid #ddd; padding: 10px;">${formatDate(cert.issue_date)}</td>
                <td style="border: 1px solid #ddd; padding: 10px;">${cert.expiry_date ? formatDate(cert.expiry_date) : 'Seumur hidup'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '<p style="color: #666; font-style: italic;">Belum ada sertifikasi</p>'}
    </div>

    <div style="margin-top: 50px; text-align: right;">
      <p style="margin-bottom: 80px;">Mengetahui,</p>
      <div style="border-top: 1px solid #000; width: 200px; margin-left: auto; padding-top: 5px;">
        <p style="margin: 0; font-weight: bold;">Kepala Lembaga Pemasyarakatan</p>
      </div>
    </div>
  `;

  // Append to body temporarily
  document.body.appendChild(content);

  try {
    // Convert to canvas
    const canvas = await html2canvas(content, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    // Create PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Save PDF
    pdf.save(`Resume_${inmate.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  } finally {
    // Clean up
    document.body.removeChild(content);
  }
};

export const generateActivityDocument = async (
  activity: any,
  participants: any[]
): Promise<void> => {
  const content = document.createElement('div');
  content.style.padding = '40px';
  content.style.fontFamily = 'Arial, sans-serif';
  content.style.backgroundColor = 'white';
  content.style.width = '210mm';
  content.style.minHeight = '297mm';

  content.innerHTML = `
    <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0066cc; padding-bottom: 20px;">
      <h1 style="color: #0066cc; margin: 0; font-size: 24px;">DOKUMEN KEGIATAN</h1>
      <h2 style="color: #666; margin: 5px 0; font-size: 18px;">Lembaga Pemasyarakatan</h2>
      <p style="margin: 5px 0; color: #888; font-size: 12px;">Tanggal Cetak: ${formatDate(new Date())}</p>
    </div>

    <div style="margin-bottom: 30px;">
      <h3 style="color: #0066cc; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 15px;">INFORMASI KEGIATAN</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="width: 25%; padding: 8px 0; font-weight: bold;">Nama Kegiatan</td>
          <td style="width: 5%; padding: 8px 0;">:</td>
          <td style="padding: 8px 0;">${activity.title}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Deskripsi</td>
          <td style="padding: 8px 0;">:</td>
          <td style="padding: 8px 0;">${activity.description || '-'}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Tanggal Mulai</td>
          <td style="padding: 8px 0;">:</td>
          <td style="padding: 8px 0;">${formatDate(activity.start_date)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Tanggal Selesai</td>
          <td style="padding: 8px 0;">:</td>
          <td style="padding: 8px 0;">${activity.end_date ? formatDate(activity.end_date) : 'Belum ditentukan'}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Narasumber</td>
          <td style="padding: 8px 0;">:</td>
          <td style="padding: 8px 0;">${activity.instructor_name || '-'}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Lokasi</td>
          <td style="padding: 8px 0;">:</td>
          <td style="padding: 8px 0;">${activity.location || '-'}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Maksimal Peserta</td>
          <td style="padding: 8px 0;">:</td>
          <td style="padding: 8px 0;">${activity.max_participants} orang</td>
        </tr>
      </table>
    </div>

    <div style="margin-bottom: 30px;">
      <h3 style="color: #0066cc; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 15px;">DAFTAR PESERTA</h3>
      ${participants.length > 0 ? `
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold;">No</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold;">Nama</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold;">NIK</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold;">Status</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold;">Tanda Tangan</th>
            </tr>
          </thead>
          <tbody>
            ${participants.map((participant, index) => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 15px;">${index + 1}</td>
                <td style="border: 1px solid #ddd; padding: 15px;">${participant.inmate?.name || '-'}</td>
                <td style="border: 1px solid #ddd; padding: 15px;">${participant.inmate?.nik || '-'}</td>
                <td style="border: 1px solid #ddd; padding: 15px;">${participant.status.toUpperCase()}</td>
                <td style="border: 1px solid #ddd; padding: 15px; height: 40px;"></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '<p style="color: #666; font-style: italic;">Belum ada peserta terdaftar</p>'}
    </div>

    <div style="margin-top: 50px;">
      <div style="display: flex; justify-content: space-between;">
        <div style="text-align: center; width: 45%;">
          <p style="margin-bottom: 80px;">Narasumber,</p>
          <div style="border-top: 1px solid #000; padding-top: 5px;">
            <p style="margin: 0; font-weight: bold;">${activity.instructor_name || '(_________________)'}</p>
          </div>
        </div>
        <div style="text-align: center; width: 45%;">
          <p style="margin-bottom: 80px;">Petugas Lapas,</p>
          <div style="border-top: 1px solid #000; padding-top: 5px;">
            <p style="margin: 0; font-weight: bold;">(_________________)</p>
          </div>
        </div>
      </div>
    </div>
  `;

  // Append to body temporarily
  document.body.appendChild(content);

  try {
    // Convert to canvas
    const canvas = await html2canvas(content, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    // Create PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Save PDF
    pdf.save(`Dokumen_Kegiatan_${activity.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  } finally {
    // Clean up
    document.body.removeChild(content);
  }
};
