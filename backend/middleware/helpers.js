const crypto = require('crypto');
const { promisify } = require('util');
const { Sequelize } = require('sequelize');
const {
    PASSWORD_PREFIX, WORKFLOW_STEPS, OFFICE_STEP_BY_DEPT,
} = require('../config/constants');

const pbkdf2Async = promisify(crypto.pbkdf2);

async function hashPassword(plain) {
    const iterations = 120000;
    const salt = crypto.randomBytes(16).toString('hex');
    const key = await pbkdf2Async(plain, salt, iterations, 64, 'sha512');
    return `${PASSWORD_PREFIX}$${iterations}$${salt}$${key.toString('hex')}`;
}

async function verifyPassword(plain, stored) {
    if (typeof stored !== 'string') return false;
    if (!stored.startsWith(`${PASSWORD_PREFIX}$`)) return plain === stored;

    const [prefix, iterText, salt, hashHex] = stored.split('$');
    if (prefix !== PASSWORD_PREFIX || !iterText || !salt || !hashHex) return false;

    const iterations = Number(iterText);
    if (!Number.isFinite(iterations) || iterations < 1) return false;

    const key = await pbkdf2Async(plain, salt, iterations, 64, 'sha512');
    const storedHash = Buffer.from(hashHex, 'hex');
    if (storedHash.length !== key.length) return false;
    return crypto.timingSafeEqual(storedHash, key);
}

function normalizeDeptName(value) {
    return String(value || '').trim().toLowerCase().replace(/\s+/g, '');
}

function resolveOfficeStepsByDept(deptName) {
    const clean = String(deptName || '').trim();
    if (!clean) return [];
    if (OFFICE_STEP_BY_DEPT[clean]) return OFFICE_STEP_BY_DEPT[clean];

    const normalized = normalizeDeptName(clean);
    const match = Object.entries(OFFICE_STEP_BY_DEPT).find(([k]) => normalizeDeptName(k) === normalized);
    if (match) return match[1];

    if (normalized.includes('วิทยบริการ') || normalized.includes('technology') || normalized.includes('library'))
        return ['library_check', 'digital_exam_check'];
    if (normalized.includes('ทะเบียน'))
        return ['file_check', 'tuition_check', 'grade_check', 'internship_fee_check'];
    if (normalized.includes('ศูนย์ภาษา') || normalized.includes('language'))
        return ['language_center'];
    if (normalized.includes('กิจกรรม') || normalized.includes('activity'))
        return ['activity_general_check', 'activity_faculty_check'];
    return [];
}

function normalizeStepStatus(status) {
    const s = String(status || '').trim().toLowerCase();
    const aliases = {
        passed: 'approved', complete: 'approved', completed: 'approved',
        inprogress: 'in_progress', 'in progress': 'in_progress', pending: 'waiting',
    };
    return aliases[s] || s;
}

function buildDefaultSteps() {
    return {
        file_check: { status: 'waiting', comment: '', updatedAt: null },
        tuition_check: { status: 'waiting', comment: '', updatedAt: null },
        grade_check: { status: 'waiting', comment: '', updatedAt: null },
        internship_fee_check: { status: 'waiting', comment: '', updatedAt: null },
        library_check: { status: 'waiting', comment: '', updatedAt: null },
        activity_general_check: { status: 'waiting', comment: '', updatedAt: null },
        activity_faculty_check: { status: 'waiting', comment: '', updatedAt: null },
        digital_exam_check: { status: 'waiting', comment: '', updatedAt: null },
        advisor: { status: 'waiting', comment: '', updatedAt: null },
        language_center: { status: 'waiting', comment: '', updatedAt: null },
        registration: { status: 'waiting', comment: '', updatedAt: null },
        activity_center: { status: 'waiting', comment: '', updatedAt: null },
    };
}

function getCanonicalStepStatuses(steps) {
    const s = steps || {};
    return {
        file_check: normalizeStepStatus(s.file_check?.status ?? s.registration?.status),
        tuition_check: normalizeStepStatus(s.tuition_check?.status ?? s.registration?.status),
        grade_check: normalizeStepStatus(s.grade_check?.status ?? s.advisor?.status),
        internship_fee_check: normalizeStepStatus(s.internship_fee_check?.status ?? s.registration?.status),
        library_check: normalizeStepStatus(s.library_check?.status),
        activity_general_check: normalizeStepStatus(s.activity_general_check?.status ?? s.activity_center?.status),
        activity_faculty_check: normalizeStepStatus(s.activity_faculty_check?.status ?? s.activity_center?.status),
        digital_exam_check: normalizeStepStatus(s.digital_exam_check?.status),
        language_center: normalizeStepStatus(s.language_center?.status),
    };
}

function syncLegacyStepAliases(steps) {
    const next = { ...buildDefaultSteps(), ...(steps || {}) };

    const regStatuses = [
        normalizeStepStatus(next.file_check?.status),
        normalizeStepStatus(next.tuition_check?.status),
        normalizeStepStatus(next.grade_check?.status),
        normalizeStepStatus(next.internship_fee_check?.status),
    ];
    let regStatus = 'waiting';
    if (regStatuses.some(s => s === 'rejected')) regStatus = 'rejected';
    else if (regStatuses.every(s => s === 'approved')) regStatus = 'approved';
    else if (regStatuses.some(s => s === 'approved' || s === 'in_progress')) regStatus = 'in_progress';

    next.registration = {
        ...(next.registration || {}),
        status: regStatus,
        updatedAt: next.registration?.updatedAt || next.file_check?.updatedAt || null,
    };

    next.advisor = {
        ...(next.advisor || {}),
        status: normalizeStepStatus(next.grade_check?.status),
        updatedAt: next.advisor?.updatedAt || next.grade_check?.updatedAt || null,
    };

    const actStatuses = [
        normalizeStepStatus(next.activity_general_check?.status),
        normalizeStepStatus(next.activity_faculty_check?.status),
    ];
    let actStatus = 'waiting';
    if (actStatuses.some(s => s === 'rejected')) actStatus = 'rejected';
    else if (actStatuses.every(s => s === 'approved')) actStatus = 'approved';
    else if (actStatuses.some(s => s === 'approved' || s === 'in_progress')) actStatus = 'in_progress';

    next.activity_center = {
        ...(next.activity_center || {}),
        status: actStatus,
        updatedAt: next.activity_center?.updatedAt || next.activity_general_check?.updatedAt || null,
    };

    return next;
}

function computeRequestStatus(steps) {
    const canonical = getCanonicalStepStatuses(steps);
    const statuses = WORKFLOW_STEPS.map(k => canonical[k]);
    if (statuses.some(s => s === 'rejected')) return 'Rejected';
    if (statuses.every(s => s === 'approved')) return 'Completed';
    if (statuses.some(s => s === 'approved' || s === 'in_progress')) return 'In Progress';
    return 'Pending';
}

function canUserUpdateStep(user, step) {
    if (!user) return false;
    if (user.role === 'Admin') return true;
    if (user.role === 'Advisor') return step === 'grade_check' || step === 'advisor';
    if (user.role === 'Office') return resolveOfficeStepsByDept(user.deptName).includes(step);
    return false;
}

function canUserUploadDocument(user, request) {
    if (!user || !request) return false;
    if (user.role === 'Admin') return true;
    if (user.role === 'Student' && user.id === request.studentId) return true;
    return false;
}

function canUserSubmitRequest(user, request) {
    if (!user || !request) return false;
    if (user.role === 'Admin') return true;
    if (user.role === 'Student' && user.id === request.studentId) return true;
    return false;
}

function canUserReadRequest(user, request) {
    if (!user || !request) return false;
    if (user.role === 'Admin') return true;
    if (user.role === 'Office') return true;
    if (user.role === 'Student') return user.id === request.studentId;
    if (user.role === 'Advisor') {
        const uFaculty = String(user.faculty || '').trim();
        const uBranch = String(user.branch || '').trim();
        const rFaculty = String(request?.User?.faculty || '').trim();
        const rBranch = String(request?.User?.branch || '').trim();
        return uFaculty && uBranch && uFaculty === rFaculty && uBranch === rBranch;
    }
    return false;
}

function sanitizeUserPayload(payload, { includePassword = false } = {}) {
    const allow = ['id', 'name', 'email', 'role', 'faculty', 'branch', 'deptName', 'phone'];
    const safe = {};
    for (const f of allow) {
        if (payload[f] !== undefined) safe[f] = payload[f];
    }
    if (includePassword && payload.password !== undefined) safe.password = payload.password;
    return safe;
}

function sanitizeRequestPayload(payload) {
    const allow = ['studentId', 'academicYear', 'semester'];
    const safe = {};
    for (const f of allow) {
        if (payload[f] !== undefined) safe[f] = payload[f];
    }
    return safe;
}

function handleServerError(res, error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
}

module.exports = {
    hashPassword, verifyPassword,
    normalizeStepStatus, buildDefaultSteps, syncLegacyStepAliases,
    computeRequestStatus, getCanonicalStepStatuses,
    canUserUpdateStep, canUserUploadDocument, canUserSubmitRequest, canUserReadRequest,
    sanitizeUserPayload, sanitizeRequestPayload, handleServerError,
    resolveOfficeStepsByDept,
};
