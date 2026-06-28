const VALID_ROLES = ['Admin', 'Advisor', 'Office', 'Student'];

const WORKFLOW_STEPS = [
    'file_check', 'tuition_check', 'grade_check', 'internship_fee_check',
    'library_check', 'activity_general_check', 'activity_faculty_check',
    'digital_exam_check', 'language_center',
];

const VALID_STEPS = [...WORKFLOW_STEPS, 'advisor', 'registration', 'activity_center'];

const VALID_STEP_STATUSES = ['waiting', 'in_progress', 'approved', 'rejected'];

const VALID_DOCUMENT_TYPES = ['general', 'internship_receipt'];

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;

const STEP_LABELS = {
    advisor: 'ที่ปรึกษา',
    grade_check: 'เกรด',
    file_check: 'ตรวจสอบไฟล์',
    tuition_check: 'ค่าลงทะเบียนเรียน',
    internship_fee_check: 'ค่าออกฝึก',
    library_check: 'ห้องสมุด',
    activity_general_check: 'กิจกรรมกลาง',
    activity_faculty_check: 'กิจกรรมคณะ',
    digital_exam_check: 'สอบดิจิทัล',
    language_center: 'ศูนย์ภาษา',
    registration: 'ฝ่ายทะเบียน',
    activity_center: 'ฝ่ายกิจกรรม',
};

const OFFICE_STEP_BY_DEPT = {
    'ฝ่ายทะเบียน': ['file_check', 'tuition_check', 'grade_check', 'internship_fee_check'],
    'ฝ่ายวิทยบริการและเทคโนโลยี': ['library_check', 'digital_exam_check'],
    'ฝ่ายศูนย์ภาษา': ['language_center'],
    'ศูนย์ภาษา': ['language_center'],
    'ฝ่ายกิจกรรม': ['activity_general_check', 'activity_faculty_check'],
};

const PASSWORD_PREFIX = 'pbkdf2';

module.exports = {
    VALID_ROLES,
    WORKFLOW_STEPS,
    VALID_STEPS,
    VALID_STEP_STATUSES,
    VALID_DOCUMENT_TYPES,
    MAX_UPLOAD_SIZE,
    STEP_LABELS,
    OFFICE_STEP_BY_DEPT,
    PASSWORD_PREFIX,
};
