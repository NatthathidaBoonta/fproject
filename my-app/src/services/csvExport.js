export const exportToCSV = (data, filename = 'graduation_report.csv') => {
  if (!Array.isArray(data) || data.length === 0) {
    alert('ไม่มีข้อมูลสำหรับส่งออกรายงาน');
    return;
  }

  // Header columns (Thai language for Excel compatibility)
  const headers = ['รหัสนักศึกษา', 'ชื่อ-นามสกุล', 'คณะ', 'สาขาวิชา', 'ปีการศึกษา', 'วันที่ส่งคำร้อง', 'สถานะภาพรวม'];
  
  const csvRows = [headers.join(',')];

  data.forEach((student) => {
    const row = [
      `"${student.studentId || ''}"`,
      `"${student.name || ''}"`,
      `"${student.faculty || ''}"`,
      `"${student.branch || ''}"`,
      `"${student.academicYear || ''}"`,
      `"${student.date || ''}"`,
      `"${student.status === 'passed' ? 'ผ่าน' : student.status === 'rejected' ? 'ไม่ผ่าน' : 'รอดำเนินการ'}"`
    ];
    csvRows.push(row.join(','));
  });

  const csvContent = '\uFEFF' + csvRows.join('\n'); // UTF-8 BOM for Thai language display in Excel
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
