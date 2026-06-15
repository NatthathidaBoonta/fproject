import { STEP_LABELS } from '../constants/stepConfig';

export const generateGraduationCertificate = (request, studentInfo) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('กรุณาเปิดใช้งาน popups สำหรับเบราว์เซอร์นี้ เพื่อดาวน์โหลดเอกสาร PDF');
    return;
  }

  const formatThaiDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' น.';
    } catch {
      return '-';
    }
  };

  const stepsHtml = Object.entries(request?.steps || {})
    .filter(([key]) => STEP_LABELS[key] && key !== 'advisor' && key !== 'registration' && key !== 'activity_center')
    .map(([key, value]) => {
      const label = STEP_LABELS[key];
      const statusText = value.status === 'approved' ? 'อนุมัติผ่าน' : 'รอดำเนินการ';
      const statusColor = value.status === 'approved' ? '#166534' : '#b45309';
      return `
        <tr>
          <td>${label}</td>
          <td style="color: ${statusColor}; font-weight: bold;">${statusText}</td>
          <td>${value.comment || '-'}</td>
          <td>${formatThaiDate(value.updatedAt)}</td>
        </tr>
      `;
    })
    .join('');

  // Generate real QR verification URL pointing to the request profile details
  const verifyUrl = `${window.location.origin}/profile`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(verifyUrl)}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>ใบรับรองการอนุมัติเสนอชื่อขอจบการศึกษา - ${studentInfo?.name || ''}</title>
      <meta charset="utf-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:ital,wght@0,300;0,400;0,700;1,400&display=swap');
        
        body {
          font-family: 'Sarabun', sans-serif;
          color: #1e293b;
          margin: 0;
          padding: 40px;
          line-height: 1.6;
          background-color: #ffffff;
        }

        .certificate-container {
          border: 4px double #064460;
          padding: 30px;
          position: relative;
          background: #ffffff;
        }

        .header {
          text-align: center;
          margin-bottom: 30px;
        }

        .logo {
          width: 80px;
          height: auto;
          margin-bottom: 15px;
        }

        .title {
          font-size: 24px;
          font-weight: bold;
          color: #064460;
          margin: 0 0 5px 0;
          letter-spacing: 0.5px;
        }

        .subtitle {
          font-size: 16px;
          color: #475569;
          margin: 0;
        }

        .student-info {
          margin: 30px 0;
          width: 100%;
          border-collapse: collapse;
        }

        .student-info td {
          padding: 6px 12px;
          font-size: 14px;
        }

        .student-info td.label {
          font-weight: bold;
          color: #475569;
          width: 150px;
        }

        .steps-table {
          width: 100%;
          border-collapse: collapse;
          margin: 30px 0;
        }

        .steps-table th, .steps-table td {
          border: 1px solid #cbd5e1;
          padding: 10px 12px;
          font-size: 13px;
          text-align: left;
        }

        .steps-table th {
          background-color: #f1f5f9;
          color: #0f172a;
          font-weight: bold;
        }

        .footer {
          margin-top: 55px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

        .signature-section {
          text-align: center;
          width: 250px;
        }

        .signature-line {
          border-bottom: 1px solid #475569;
          margin-bottom: 8px;
          height: 40px;
        }

        .qr-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          font-size: 11px;
          color: #64748b;
        }

        .qr-code {
          width: 90px;
          height: 90px;
          margin-bottom: 8px;
          border: 1px solid #cbd5e1;
          padding: 4px;
          border-radius: 4px;
        }

        @media print {
          body {
            padding: 0;
          }
          .certificate-container {
            border: 4px double #064460;
          }
          button {
            display: none;
          }
        }

        .print-btn {
          position: fixed;
          bottom: 20px;
          right: 20px;
          padding: 10px 20px;
          background-color: #064460;
          color: #ffffff;
          border: none;
          border-radius: 6px;
          font-family: 'Sarabun', sans-serif;
          font-size: 14px;
          font-weight: bold;
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(0,0,0,0.15);
        }

        .print-btn:hover {
          background-color: #095a80;
        }
      </style>
    </head>
    <body>
      <button class="print-btn" onclick="window.print()">พิมพ์ใบรับรอง (Print)</button>
      <div class="certificate-container">
        <div class="header">
          <img class="logo" src="https://upload.wikimedia.org/wikipedia/commons/4/40/Generic_Coat_of_Arms_1.svg" alt="SSKRU Logo" onerror="this.src='https://placehold.co/100?text=SSKRU'"/>
          <h1 class="title">ใบอนุมัติเสนอชื่อขอจบการศึกษา</h1>
          <p class="subtitle">มหาวิทยาลัยราชภัฏศรีสะเกษ (SSKRU)</p>
        </div>

        <hr style="border: 0; border-top: 1px solid #cbd5e1; margin: 20px 0;">

        <table class="student-info">
          <tr>
            <td class="label">ชื่อ-นามสกุล:</td>
            <td>${studentInfo?.name || '-'}</td>
            <td class="label">รหัสนักศึกษา:</td>
            <td>${studentInfo?.id || '-'}</td>
          </tr>
          <tr>
            <td class="label">คณะ / สำนัก:</td>
            <td>${studentInfo?.faculty || '-'}</td>
            <td class="label">สาขาวิชา:</td>
            <td>${studentInfo?.branch || '-'}</td>
          </tr>
          <tr>
            <td class="label">ปีการศึกษาจบ:</td>
            <td>ภาคเรียนที่ ${request?.semester || '-'} / ปีการศึกษา ${request?.academicYear || '-'}</td>
            <td class="label">วันที่ผ่านสมบูรณ์:</td>
            <td>${formatThaiDate(request?.updatedAt)}</td>
          </tr>
        </table>

        <p style="font-size: 14px; font-weight: bold; margin-bottom: 10px; color: #064460;">📋 สรุปผลการตรวจสอบประวัติการอนุมัติหน่วยงาน:</p>
        <table class="steps-table">
          <thead>
            <tr>
              <th style="width: 30%">ฝ่ายงานตรวจสอบ</th>
              <th style="width: 20%">สถานะ</th>
              <th style="width: 25%">ความคิดเห็นเพิ่มเติม</th>
              <th style="width: 25%">วันที่อนุมัติ</th>
            </tr>
          </thead>
          <tbody>
            ${stepsHtml}
          </tbody>
        </table>

        <div class="footer">
          <div class="qr-section">
            <img class="qr-code" src="${qrUrl}" alt="Verification QR Code">
            <span>สแกนเพื่อตรวจสอบความถูกต้องเอกสาร</span>
          </div>
          
          <div class="signature-section">
            <div class="signature-line"></div>
            <p style="margin: 0; font-size: 13px; font-weight: bold; color: #475569;">( งานทะเบียนและประมวลผลการศึกษา )</p>
            <p style="margin: 3px 0 0 0; font-size: 11px; color: #64748b;">ผู้ออกเอกสารและรับรองผลระบบ</p>
          </div>
        </div>
      </div>
      <script>
        window.onload = function() {
          // Auto trigger print in window
        }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
