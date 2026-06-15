export const STEP_LABELS = {
  file_check: 'ตรวจสอบไฟล์',
  tuition_check: 'ค่าลงทะเบียนเรียน',
  grade_check: 'เกรด',
  internship_fee_check: 'ค่าออกฝึก',
  library_check: 'ห้องสมุด',
  activity_general_check: 'กิจกรรมกลาง',
  activity_faculty_check: 'กิจกรรมคณะ',
  digital_exam_check: 'สอบดิจิทัล',
  language_center: 'ศูนย์ภาษา',
  advisor: 'ที่ปรึกษา',
  registration: 'ฝ่ายทะเบียน',
  activity_center: 'ฝ่ายกิจกรรม',
};

export const WORKFLOW_STEPS = [
  'file_check',
  'tuition_check',
  'grade_check',
  'internship_fee_check',
  'library_check',
  'activity_general_check',
  'activity_faculty_check',
  'digital_exam_check',
  'language_center',
];

export const VALID_STEPS = [
  ...WORKFLOW_STEPS,
  'advisor',
  'registration',
  'activity_center',
];

export const statusConfig = {
  waiting: { label: 'รอดำเนินการ', color: '#FACC15', text: '#92400E', bg: '#FFFBEB' },
  in_progress: { label: 'กำลังดำเนินการ', color: '#3b82f6', text: '#1d4ed8', bg: '#dbeafe' },
  approved: { label: 'ผ่าน', color: '#16a34a', text: '#166534', bg: '#dcfce7' },
  rejected: { label: 'ไม่ผ่าน', color: '#dc2626', text: '#991b1b', bg: '#fee2e2' },
};

export const stepToTaskStatus = {
  waiting: 'waiting',
  in_progress: 'waiting',
  approved: 'approved',
  rejected: 'rejected',
};

export const requestStatusToHistoryStatus = {
  Pending: 'waiting',
  'In Progress': 'in_progress',
  Completed: 'approved',
  Rejected: 'rejected',
};

export const stepStatusToThai = {
  waiting: 'รอดำเนินการ',
  in_progress: 'กำลังตรวจสอบ',
  approved: 'ผ่าน',
  rejected: 'ไม่ผ่าน',
};

export const taskStepMap = {
  'โครงสร้างหลักสูตร': 'tuition_check',
  'ห้องสมุด': 'library_check',
  'สอบดิจิทัล': 'digital_exam_check',
  'สอบอังกฤษ': 'language_center',
  'ชำระค่าออกฝึก': 'internship_fee_check',
  'ที่ปรึกษาตรวจสอบ': 'grade_check',
};

export const taskItemStepMap = {
  'โครงสร้างหลักสูตร': {
    'ผลการเรียน': 'grade_check',
    'ค่าลงทะเบียนเรียน': 'tuition_check',
    'สถานภาพ': 'file_check',
  },
};

export const taskDetails = {
  "โครงสร้างหลักสูตร": [
    { label: "ผลการเรียน", value: "รอดำเนินการ" },
    { label: "ค่าลงทะเบียนเรียน", value: "รอดำเนินการ" },
    { label: "สถานภาพ", value: "รอดำเนินการ" },
  ],
  "ห้องสมุด": [
    { label: "ค้างชำระ", value: "รอดำเนินการ" },
  ],
  "กิจกรรม": [
    { label: "ผลกิจกรรม", value: "รอดำเนินการ" },
  ],
  "สอบดิจิทัล": [
    { label: "เกณฑ์การสอบ", value: "รอดำเนินการ" },
  ],
  "สอบอังกฤษ": [
    { label: "เกณฑ์การสอบ", value: "รอดำเนินการ" },
  ],
  "เอกสารที่อัปโหลด": [
    { label: "อัปโหลดล่าสุด", value: "รอดำเนินการ" },
    { label: "ผลการตรวจสอบ", value: "รอดำเนินการ" },
  ],
  "ชำระค่าออกฝึก": [
    { label: "ผลการตรวจสอบ", value: "รอดำเนินการ" },
  ],
  "ที่ปรึกษาตรวจสอบ": [
    { label: "ผลการตรวจสอบ", value: "รอดำเนินการ" },
  ],
};

