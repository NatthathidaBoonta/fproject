const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const crypto = require('crypto');
const { promisify } = require('util');
require('dotenv').config({ override: true });

const app = express();
const PORT = process.env.PORT || 5000;
const pbkdf2Async = promisify(crypto.pbkdf2);
const PASSWORD_PREFIX = 'pbkdf2';
const VALID_ROLES = ['Admin', 'Advisor', 'Office', 'Student'];
const WORKFLOW_STEPS = ['file_check', 'tuition_check', 'grade_check', 'internship_fee_check', 'library_check', 'activity_general_check', 'activity_faculty_check', 'digital_exam_check', 'language_center'];
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

function normalizeDeptName(value) {
    return String(value || '').trim().toLowerCase().replace(/\s+/g, '');
}

function resolveOfficeStepsByDept(deptName) {
    const cleanedDept = String(deptName || '').trim();
    if (!cleanedDept) return [];

    if (OFFICE_STEP_BY_DEPT[cleanedDept]) {
        return OFFICE_STEP_BY_DEPT[cleanedDept];
    }

    const normalizedDept = normalizeDeptName(cleanedDept);
    const exactNormalizedMatch = Object.entries(OFFICE_STEP_BY_DEPT).find(([key]) => normalizeDeptName(key) === normalizedDept);
    if (exactNormalizedMatch) {
        return exactNormalizedMatch[1];
    }

    if (normalizedDept.includes('ทะเบียน') || normalizedDept.includes('วิทยบริการ') || normalizedDept.includes('technology') || normalizedDept.includes('library')) {
        if (normalizedDept.includes('วิทยบริการ') || normalizedDept.includes('technology') || normalizedDept.includes('library')) {
            return ['library_check', 'digital_exam_check'];
        }
        return ['file_check', 'tuition_check', 'grade_check', 'internship_fee_check'];
    }
    if (normalizedDept.includes('ศูนย์ภาษา') || normalizedDept.includes('language')) {
        return ['language_center'];
    }
    if (normalizedDept.includes('กิจกรรม') || normalizedDept.includes('activity')) {
        return ['activity_general_check', 'activity_faculty_check'];
    }

    return [];
}

function canUserUpdateStep(user, step) {
    if (!user) return false;
    if (user.role === 'Admin') return true;
    if (user.role === 'Advisor') return step === 'grade_check' || step === 'advisor';
    if (user.role === 'Office') {
        const allowedSteps = resolveOfficeStepsByDept(user.deptName);
        return allowedSteps.includes(step);
    }
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

async function notifyReviewersForSubmittedRequest(request) {
    const student = await User.findByPk(request.studentId);
    if (!student) return;

    const advisorUsers = await User.findAll({
        where: {
            role: 'Advisor',
            faculty: student.faculty,
            branch: student.branch,
        }
    });

    const officeUsers = await User.findAll({
        where: {
            role: 'Office',
            deptName: {
                [Sequelize.Op.in]: ['ฝ่ายทะเบียน', 'ฝ่ายวิทยบริการและเทคโนโลยี', 'ฝ่ายศูนย์ภาษา', 'ฝ่ายกิจกรรม']
            }
        }
    });

    const message = `มีคำร้องขอจบการศึกษาใหม่จาก ${student.name} (${student.id}) รอการตรวจสอบ`;

    for (const advisor of advisorUsers) {
        await Notification.create({
            userId: advisor.id,
            message,
            type: 'REVIEW_ASSIGNED'
        });
    }

    for (const officer of officeUsers) {
        await Notification.create({
            userId: officer.id,
            message,
            type: 'REVIEW_ASSIGNED'
        });
    }
}

function canUserReadRequest(user, request) {
    if (!user || !request) return false;
    if (user.role === 'Admin') return true;
    if (user.role === 'Office') return true;
    if (user.role === 'Student') return user.id === request.studentId;
    if (user.role === 'Advisor') {
        const userFaculty = String(user.faculty || '').trim();
        const userBranch = String(user.branch || '').trim();
        const requestFaculty = String(request?.User?.faculty || '').trim();
        const requestBranch = String(request?.User?.branch || '').trim();
        return userFaculty && userBranch && userFaculty === requestFaculty && userBranch === requestBranch;
    }
    return false;
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
    const safeSteps = steps || {};
    return {
        file_check: normalizeStepStatus(safeSteps.file_check?.status ?? safeSteps.registration?.status),
        tuition_check: normalizeStepStatus(safeSteps.tuition_check?.status ?? safeSteps.registration?.status),
        grade_check: normalizeStepStatus(safeSteps.grade_check?.status ?? safeSteps.advisor?.status),
        internship_fee_check: normalizeStepStatus(safeSteps.internship_fee_check?.status ?? safeSteps.registration?.status),
        library_check: normalizeStepStatus(safeSteps.library_check?.status),
        activity_general_check: normalizeStepStatus(safeSteps.activity_general_check?.status ?? safeSteps.activity_center?.status),
        activity_faculty_check: normalizeStepStatus(safeSteps.activity_faculty_check?.status ?? safeSteps.activity_center?.status),
        digital_exam_check: normalizeStepStatus(safeSteps.digital_exam_check?.status),
        language_center: normalizeStepStatus(safeSteps.language_center?.status),
    };
}

function syncLegacyStepAliases(steps) {
    const nextSteps = { ...buildDefaultSteps(), ...(steps || {}) };

    const registrationStatuses = [
        normalizeStepStatus(nextSteps.file_check?.status),
        normalizeStepStatus(nextSteps.tuition_check?.status),
        normalizeStepStatus(nextSteps.grade_check?.status),
        normalizeStepStatus(nextSteps.internship_fee_check?.status),
    ];

    let registrationStatus = 'waiting';
    if (registrationStatuses.some(status => status === 'rejected')) {
        registrationStatus = 'rejected';
    } else if (registrationStatuses.every(status => status === 'approved')) {
        registrationStatus = 'approved';
    } else if (registrationStatuses.some(status => status === 'approved' || status === 'in_progress')) {
        registrationStatus = 'in_progress';
    }

    nextSteps.registration = {
        ...(nextSteps.registration || {}),
        status: registrationStatus,
        updatedAt: nextSteps.registration?.updatedAt
            || nextSteps.file_check?.updatedAt
            || nextSteps.tuition_check?.updatedAt
            || nextSteps.grade_check?.updatedAt
            || nextSteps.internship_fee_check?.updatedAt
            || null,
    };

    nextSteps.advisor = {
        ...(nextSteps.advisor || {}),
        status: normalizeStepStatus(nextSteps.grade_check?.status),
        updatedAt: nextSteps.advisor?.updatedAt || nextSteps.grade_check?.updatedAt || null,
    };

    const activityStatuses = [
        normalizeStepStatus(nextSteps.activity_general_check?.status),
        normalizeStepStatus(nextSteps.activity_faculty_check?.status),
    ];

    let activityCenterStatus = 'waiting';
    if (activityStatuses.some(status => status === 'rejected')) {
        activityCenterStatus = 'rejected';
    } else if (activityStatuses.every(status => status === 'approved')) {
        activityCenterStatus = 'approved';
    } else if (activityStatuses.some(status => status === 'approved' || status === 'in_progress')) {
        activityCenterStatus = 'in_progress';
    }

    nextSteps.activity_center = {
        ...(nextSteps.activity_center || {}),
        status: activityCenterStatus,
        updatedAt: nextSteps.activity_center?.updatedAt
            || nextSteps.activity_general_check?.updatedAt
            || nextSteps.activity_faculty_check?.updatedAt
            || null,
    };

    return nextSteps;
}

function normalizeStepStatus(stepStatus) {
    const normalized = String(stepStatus || '').trim().toLowerCase();
    const aliases = {
        passed: 'approved',
        complete: 'approved',
        completed: 'approved',
        inprogress: 'in_progress',
        'in progress': 'in_progress',
        pending: 'waiting',
    };
    return aliases[normalized] || normalized;
}

function computeRequestStatus(steps) {
    const canonicalStatuses = getCanonicalStepStatuses(steps);
    const statuses = WORKFLOW_STEPS.map(stepKey => canonicalStatuses[stepKey]);

    if (statuses.some(status => status === 'rejected')) {
        return 'Rejected';
    }

    if (statuses.every(status => status === 'approved')) {
        return 'Completed';
    }

    if (statuses.some(status => status === 'approved' || status === 'in_progress')) {
        return 'In Progress';
    }

    return 'Pending';
}

function sanitizeRequestPayload(payload) {
    const safePayload = {};
    const allowList = ['studentId', 'academicYear', 'semester'];

    for (const field of allowList) {
        if (payload[field] !== undefined) {
            safePayload[field] = payload[field];
        }
    }

    return safePayload;
}

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const uploadStorage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (_req, file, cb) => {
        const extension = path.extname(file.originalname || '').toLowerCase();
        cb(null, `${Date.now()}-${crypto.randomUUID()}${extension}`);
    }
});

const upload = multer({
    storage: uploadStorage,
    limits: { fileSize: MAX_UPLOAD_SIZE },
    fileFilter: (_req, file, cb) => {
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Invalid file type'));
        }
        return cb(null, true);
    }
});

async function hashPassword(plainPassword) {
    const iterations = 120000;
    const salt = crypto.randomBytes(16).toString('hex');
    const derivedKey = await pbkdf2Async(plainPassword, salt, iterations, 64, 'sha512');
    return `${PASSWORD_PREFIX}$${iterations}$${salt}$${derivedKey.toString('hex')}`;
}

async function verifyPassword(plainPassword, storedPassword) {
    if (typeof storedPassword !== 'string') return false;

    if (!storedPassword.startsWith(`${PASSWORD_PREFIX}$`)) {
        return plainPassword === storedPassword;
    }

    const [prefix, iterationText, salt, hashHex] = storedPassword.split('$');
    if (prefix !== PASSWORD_PREFIX || !iterationText || !salt || !hashHex) {
        return false;
    }

    const iterations = Number(iterationText);
    if (!Number.isFinite(iterations) || iterations < 1) {
        return false;
    }

    const derivedKey = await pbkdf2Async(plainPassword, salt, iterations, 64, 'sha512');
    const storedHash = Buffer.from(hashHex, 'hex');
    if (storedHash.length !== derivedKey.length) {
        return false;
    }

    return crypto.timingSafeEqual(storedHash, derivedKey);
}

function sanitizeUserPayload(payload, { includePassword = false } = {}) {
    const safePayload = {};
    const allowList = ['id', 'name', 'email', 'role', 'faculty', 'branch', 'deptName', 'phone'];

    for (const field of allowList) {
        if (payload[field] !== undefined) {
            safePayload[field] = payload[field];
        }
    }

    if (includePassword && payload.password !== undefined) {
        safePayload.password = payload.password;
    }

    return safePayload;
}

function handleServerError(res, error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
}

// --- 1. Database Configuration ---
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'database.sqlite'),
    logging: false,
});

// --- 2. Models Definition ---

// User Model
const User = sequelize.define('User', {
    id: { type: DataTypes.STRING, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM('Admin', 'Advisor', 'Office', 'Student'), allowNull: false },
    faculty: DataTypes.STRING,
    branch: DataTypes.STRING,
    deptName: DataTypes.STRING,
    phone: DataTypes.STRING,
});

// Graduation Request Model
const GraduationRequest = sequelize.define('GraduationRequest', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    studentId: { type: DataTypes.STRING, allowNull: false },
    academicYear: { type: DataTypes.STRING, allowNull: false },
    semester: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.ENUM('Pending', 'In Progress', 'Completed', 'Rejected'), defaultValue: 'Pending' },
    steps: {
        type: DataTypes.JSON,
        defaultValue: buildDefaultSteps(),
    },
    documents: {
        type: DataTypes.JSON,
        defaultValue: [],
    },
});

// Notification Model
const Notification = sequelize.define('Notification', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.STRING, allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    type: { type: DataTypes.STRING, defaultValue: 'GENERAL' },
    isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
});

// Audit Log Model
const AuditLog = sequelize.define('AuditLog', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.STRING, allowNull: false },
    action: { type: DataTypes.STRING, allowNull: false },
    requestId: { type: DataTypes.STRING, allowNull: true },
    details: { type: DataTypes.TEXT, allowNull: true },
});

// --- 3. Master Data ---
const facultyData = [
    {
        name: "คณะครุศาสตร์และการพัฒนามนุษย์",
        branches: [
            "การประถมศึกษา",
            "การศึกษาปฐมวัย",
            "คณิตศาสตร์",
            "วิทยาศาสตร์ทั่วไป",
            "คอมพิวเตอร์ศึกษา",
            "ภาษาอังกฤษ",
            "ภาษาไทย",
            "สังคมศึกษา",
            "ดนตรีศึกษา",
            "พลศึกษา",
            "การสอนภาษาจีน",
            "นาฏศิลป์ศึกษา"
        ]
    },
    {
        name: "คณะศิลปศาสตร์และวิทยาศาสตร์",
        branches: [
            "วิทยาการคอมพิวเตอร์",
            "เทคโนโลยีคอมพิวเตอร์และดิจิทัล",
            "เทคโนโลยีและนวัตกรรมอาหาร",
            "วิทยาศาสตร์สิ่งแวดล้อม",
            "สาธารณสุขชุมชน",
            "วิทยาศาสตร์การกีฬา",
            "เทคโนโลยีการเกษตร",
            "อาชีวอนามัยและความปลอดภัย",
            "วิศวกรรมซอฟต์แวร์",
            "วิศวกรรมโลจิสติกส์",
            "วิศวกรรมการจัดการอุตสาหกรรมและสิ่งแวดล้อม",
            "การออกแบบผลิตภัณฑ์และนวัตกรรมวัสดุ",
            "เทคโนโลยีโยธาและสถาปัตยกรรม"
        ]
    },
    {
        name: "คณะมนุษยศาสตร์และสังคมศาสตร์",
        branches: [
            "การพัฒนาชุมชน",
            "ภาษาจีน",
            "ภาษาญี่ปุ่น",
            "ภาษาอังกฤษธุรกิจ",
            "บรรณารักษศาสตร์และสารสนเทศศาสตร์",
            "ศิลปะและการออกแบบ",
            "ภาษาไทยเพื่อการสื่อสาร",
            "ประวัติศาสตร์",
            "นิเทศศาสตร์"
        ]
    },
    {
        name: "วิทยาลัยกฎหมายและการปกครอง",
        branches: [
            "นิติศาสตร์",
            "รัฐประศาสนศาสตร์",
            "รัฐศาสตร์"
        ]
    },
    {
        name: "คณะบริหารธุรกิจและการบัญชี",
        branches: [
            "การจัดการ",
            "การตลาด",
            "คอมพิวเตอร์ธุรกิจ",
            "บริหารธุรกิจระหว่างประเทศ",
            "เศรษฐศาสตร์การเงินและการคลัง",
            "การจัดการการท่องเที่ยวและการโรงแรม",
            "การบัญชี"
        ]
    },
    {
        name: "คณะพยาบาลศาสตร์",
        branches: [
            "พยาบาลศาสตร์"
            // "ประกาศนียบัตรผู้ช่วยพยาบาล" // Usually not a degree branch but can be added if needed
        ]
    }
];

const officeDepts = [
    "ฝ่ายทะเบียน",
    "ฝ่ายวิทยบริการและเทคโนโลยี",
    "ฝ่ายศูนย์ภาษา",
    "ฝ่ายกิจกรรม"
];

// --- 4. Middleware ---
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

const corsOptions = allowedOrigins.length > 0
    ? {
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(new Error('CORS policy violation'));
        }
    }
    : {};

app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
app.use('/uploads', express.static(uploadsDir));

// --- 5. Routes & Business Logic ---

// Master Data Route
app.get('/api/master-data', (req, res) => {
    res.json({ faculties: facultyData, departments: officeDepts });
});

// [User Routes]
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Email or password incorrect' });
        }

        const isPasswordValid = await verifyPassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Email or password incorrect' });
        }

        if (!String(user.password).startsWith(`${PASSWORD_PREFIX}$`)) {
            user.password = await hashPassword(password);
            await user.save();
        }

        const { password: _, ...userWithoutPassword } = user.toJSON();
        res.json(userWithoutPassword);
    } catch (error) {
        return handleServerError(res, error);
    }
});

app.get('/api/users', async (req, res) => {
    try {
        const users = await User.findAll({ attributes: { exclude: ['password'] } });
        res.json(users);
    } catch (error) {
        return handleServerError(res, error);
    }
});

app.post('/api/users', async (req, res) => {
    try {
        const payload = sanitizeUserPayload(req.body, { includePassword: true });
        if (!payload.password || !payload.email || !payload.id || !payload.name || !payload.role) {
            return res.status(400).json({ message: 'Missing required user fields' });
        }
        if (!VALID_ROLES.includes(payload.role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        payload.password = await hashPassword(payload.password);

        const user = await User.create(payload);
        const { password, ...userWithoutPassword } = user.toJSON();
        res.status(201).json(userWithoutPassword);
    } catch (error) {
        return handleServerError(res, error);
    }
});

app.put('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const payload = sanitizeUserPayload(req.body, { includePassword: true });
        if (payload.role && !VALID_ROLES.includes(payload.role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        if (payload.password) {
            payload.password = await hashPassword(payload.password);
        }

        const [updated] = await User.update(payload, { where: { id } });
        if (updated) {
            const updatedUser = await User.findByPk(id, { attributes: { exclude: ['password'] } });
            return res.json(updatedUser);
        }
        res.status(404).json({ message: 'User not found' });
    } catch (error) {
        return handleServerError(res, error);
    }
});

app.delete('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await User.destroy({ where: { id } });
        if (deleted) {
            return res.json({ message: 'User deleted' });
        }
        res.status(404).json({ message: 'User not found' });
    } catch (error) {
        return handleServerError(res, error);
    }
});

// Associations
User.hasMany(GraduationRequest, { foreignKey: 'studentId' });
GraduationRequest.belongsTo(User, { foreignKey: 'studentId' });

// [Graduation Request Routes]
app.get('/api/requests', async (req, res) => {
    try {
        const { step, studentId, userId, submittedOnly } = req.query;
        if (!userId || typeof userId !== 'string') {
            return res.status(400).json({ message: 'userId query is required' });
        }

        const actor = await User.findByPk(userId);
        if (!actor) {
            return res.status(403).json({ message: 'User not found for this action' });
        }

        const requests = await GraduationRequest.findAll({
            where: studentId ? { studentId } : undefined,
            include: [{
                model: User,
                attributes: ['name', 'faculty', 'branch', 'deptName']
            }]
        });

        let accessibleRequests = requests.filter(request => canUserReadRequest(actor, request));

        if (step) {
            const targetStep = String(step);
            if (!VALID_STEPS.includes(targetStep)) {
                return res.status(400).json({ message: 'Invalid step filter' });
            }
            accessibleRequests = accessibleRequests.filter(request => request?.steps?.[targetStep]);
        }

        const shouldFilterSubmittedOnly = String(submittedOnly || '').toLowerCase() === 'true';
        if (shouldFilterSubmittedOnly) {
            accessibleRequests = accessibleRequests.filter(request => {
                const steps = request?.steps || {};
                const statuses = VALID_STEPS
                    .map(stepKey => steps?.[stepKey]?.status)
                    .map(normalizeStepStatus);
                return statuses.some(status => status !== 'waiting');
            });
        }

        res.json(accessibleRequests);
    } catch (error) {
        return handleServerError(res, error);
    }
});

app.get('/api/requests/:id', async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId || typeof userId !== 'string') {
            return res.status(400).json({ message: 'userId query is required' });
        }

        const actor = await User.findByPk(userId);
        if (!actor) {
            return res.status(403).json({ message: 'User not found for this action' });
        }

        const request = await GraduationRequest.findByPk(req.params.id, {
            include: [{
                model: User,
                attributes: ['name', 'faculty', 'branch', 'deptName']
            }]
        });
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (!canUserReadRequest(actor, request)) {
            return res.status(403).json({ message: 'You are not allowed to view this request' });
        }

        return res.json(request);
    } catch (error) {
        return handleServerError(res, error);
    }
});

app.post('/api/requests', async (req, res) => {
    try {
        const payload = sanitizeRequestPayload(req.body);
        if (!payload.studentId || !payload.academicYear || !payload.semester) {
            return res.status(400).json({ message: 'Missing required request fields' });
        }

        const student = await User.findByPk(payload.studentId);
        if (!student || student.role !== 'Student') {
            return res.status(400).json({ message: 'Student not found' });
        }

        const steps = syncLegacyStepAliases(buildDefaultSteps());
        const newRequest = await GraduationRequest.create({
            ...payload,
            steps,
            status: computeRequestStatus(steps),
        });
        res.status(201).json(newRequest);
    } catch (error) {
        return handleServerError(res, error);
    }
});

app.post('/api/requests/:id/submit', async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;

        if (!userId || typeof userId !== 'string') {
            return res.status(400).json({ message: 'Invalid userId' });
        }

        const actor = await User.findByPk(userId);
        if (!actor) {
            return res.status(403).json({ message: 'User not found for this action' });
        }

        const request = await GraduationRequest.findByPk(id);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (!canUserSubmitRequest(actor, request)) {
            return res.status(403).json({ message: 'You are not allowed to submit this request' });
        }

        if (request.status === 'Completed') {
            return res.status(400).json({ message: 'Completed request cannot be submitted again' });
        }

        const now = new Date();
        const updatedSteps = { ...buildDefaultSteps(), ...(request.steps || {}) };
        let hasChanged = false;

        const shouldReopenWaitingSteps = request.status !== 'Rejected';

        for (const stepKey of WORKFLOW_STEPS) {
            const currentStep = updatedSteps[stepKey] || { status: 'waiting', comment: '', updatedAt: null };
            const normalizedCurrentStatus = normalizeStepStatus(currentStep.status);

            const shouldReopenRejected = normalizedCurrentStatus === 'rejected';
            const shouldStartWaiting = shouldReopenWaitingSteps && normalizedCurrentStatus === 'waiting';

            if (shouldReopenRejected || shouldStartWaiting) {
                updatedSteps[stepKey] = {
                    ...currentStep,
                    status: 'in_progress',
                    updatedAt: now,
                };
                hasChanged = true;
            }
        }

        const normalizedSteps = syncLegacyStepAliases(updatedSteps);

        request.steps = normalizedSteps;
        request.status = computeRequestStatus(normalizedSteps);
        await request.save();

        await AuditLog.create({
            userId: actor.id,
            action: 'SUBMIT_REQUEST_FOR_REVIEW',
            requestId: id,
            details: `request submitted for multi-department review by: ${actor.id}`
        });

        if (hasChanged) {
            await notifyReviewersForSubmittedRequest(request);
        }

        return res.json({
            success: true,
            message: hasChanged ? 'Request submitted for review' : 'Request already in review process',
            data: request,
        });
    } catch (error) {
        return handleServerError(res, error);
    }
});

// อัปเดตสถานะแบบกลุ่มรายแผนก (Batch Update)
app.patch('/api/requests/batch/step', async (req, res) => {
    const { ids, step, status, comment, userId } = req.body;

    try {
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'Invalid or empty ids array' });
        }
        if (!VALID_STEPS.includes(step)) {
            return res.status(400).json({ message: 'Invalid step' });
        }
        const normalizedStatus = normalizeStepStatus(status);
        if (!VALID_STEP_STATUSES.includes(normalizedStatus)) {
            return res.status(400).json({ message: 'Invalid step status' });
        }
        if (!userId || typeof userId !== 'string') {
            return res.status(400).json({ message: 'Invalid userId' });
        }

        const actor = await User.findByPk(userId);
        if (!actor) {
            return res.status(403).json({ message: 'User not found for this action' });
        }
        if (!canUserUpdateStep(actor, step)) {
            return res.status(403).json({ message: 'You are not allowed to update this step' });
        }

        const safeComment = typeof comment === 'string' ? comment.trim() : '';

        for (const id of ids) {
            const request = await GraduationRequest.findByPk(id);
            if (request) {
                const updatedSteps = { ...buildDefaultSteps(), ...(request.steps || {}) };
                if (updatedSteps[step]) {
                    // Check if current status is already approved
                    const currentStatus = normalizeStepStatus(updatedSteps[step]?.status);
                    if (currentStatus === 'approved' && normalizedStatus !== 'approved') {
                        continue; // Skip changing approved steps
                    }

                    updatedSteps[step] = {
                        status: normalizedStatus,
                        comment: safeComment,
                        updatedAt: new Date(),
                    };

                    const normalizedSteps = syncLegacyStepAliases(updatedSteps);
                    request.steps = normalizedSteps;
                    request.status = computeRequestStatus(normalizedSteps);
                    await request.save();

                    // ส่งการแจ้งเตือน
                    if (normalizedStatus === 'rejected') {
                        await Notification.create({
                            userId: request.studentId,
                            message: `คำร้องขอจบการศึกษาในส่วน ${STEP_LABELS[step] || step} ถูกปฏิเสธ${safeComment ? `: ${safeComment}` : ''}`,
                            type: 'REJECTED'
                        });
                    } else if (request.status === 'Completed') {
                        await Notification.create({
                            userId: request.studentId,
                            message: 'คำร้องขอจบการศึกษาของคุณผ่านการตรวจสอบครบทุกส่วนแล้ว',
                            type: 'COMPLETED'
                        });
                    }

                    // บันทึกประวัติ (Audit Log)
                    await AuditLog.create({
                        userId,
                        action: 'UPDATE_STEP_STATUS',
                        requestId: id,
                        details: `[Batch] ${step} set to ${normalizedStatus} by officer: ${userId}`
                    });
                }
            }
        }

        res.json({ success: true, count: ids.length });
    } catch (error) {
        return handleServerError(res, error);
    }
});

// อัปเดตสถานะรายแผนก (Technique: Audit Log + Notifications)
app.patch('/api/requests/:id/step', async (req, res) => {
    const { id } = req.params;
    const { step, status, comment, userId } = req.body;

    try {
        if (!VALID_STEPS.includes(step)) {
            return res.status(400).json({ message: 'Invalid step' });
        }
        const normalizedStatus = normalizeStepStatus(status);
        if (!VALID_STEP_STATUSES.includes(normalizedStatus)) {
            return res.status(400).json({ message: 'Invalid step status' });
        }
        if (!userId || typeof userId !== 'string') {
            return res.status(400).json({ message: 'Invalid userId' });
        }

        const actor = await User.findByPk(userId);
        if (!actor) {
            return res.status(403).json({ message: 'User not found for this action' });
        }
        if (!canUserUpdateStep(actor, step)) {
            return res.status(403).json({ message: 'You are not allowed to update this step' });
        }

        const request = await GraduationRequest.findByPk(id);
        if (!request) return res.status(404).json({ message: 'Request not found' });

        const updatedSteps = { ...buildDefaultSteps(), ...(request.steps || {}) };
        if (!updatedSteps[step]) return res.status(400).json({ message: 'Invalid step' });

        // Check if current status is already approved
        const currentStatus = normalizeStepStatus(updatedSteps[step]?.status);
        if (currentStatus === 'approved' && normalizedStatus !== 'approved') {
            return res.status(400).json({ message: 'Cannot modify a step that has already been approved' });
        }

        const safeComment = typeof comment === 'string' ? comment.trim() : '';

        updatedSteps[step] = {
            status: normalizedStatus,
            comment: safeComment,
            updatedAt: new Date(),
        };

        const normalizedSteps = syncLegacyStepAliases(updatedSteps);
        request.steps = normalizedSteps;
        request.status = computeRequestStatus(normalizedSteps);
        await request.save();

        // 1. ส่งแจ้งเตือนถ้านิสิตถูก Reject
        if (normalizedStatus === 'rejected') {
            await Notification.create({
                userId: request.studentId,
                message: `คำร้องขอจบการศึกษาในส่วน ${STEP_LABELS[step] || step} ถูกปฏิเสธ${safeComment ? `: ${safeComment}` : ''}`,
                type: 'REJECTED'
            });
        } else if (request.status === 'Completed') {
            await Notification.create({
                userId: request.studentId,
                message: 'คำร้องขอจบการศึกษาของคุณผ่านการตรวจสอบครบทุกส่วนแล้ว',
                type: 'COMPLETED'
            });
        }

        // 2. บันทึกประวัติ (Audit Log) ว่าใครเป็นคนทำรายการ
        await AuditLog.create({
            userId,
            action: 'UPDATE_STEP_STATUS',
            requestId: id,
            details: `${step} set to ${normalizedStatus} by officer: ${userId}`
        });

        res.json({ success: true, data: request });
    } catch (error) {
        return handleServerError(res, error);
    }
});

app.post('/api/requests/:id/documents', (req, res, next) => {
    upload.single('file')(req, res, (error) => {
        if (!error) {
            return next();
        }

        if (error instanceof multer.MulterError) {
            if (error.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: 'File size exceeds 5MB limit' });
            }
            return res.status(400).json({ message: 'Upload failed' });
        }

        if (error.message === 'Invalid file type') {
            return res.status(400).json({ message: 'Only PDF, JPG, and PNG files are allowed' });
        }

        return res.status(400).json({ message: 'Upload failed' });
    });
}, async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, documentType } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: 'File is required' });
        }

        const request = await GraduationRequest.findByPk(id);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (!userId || typeof userId !== 'string') {
            return res.status(400).json({ message: 'Invalid userId' });
        }

        const normalizedDocumentType = String(documentType || 'general').trim().toLowerCase();
        if (!VALID_DOCUMENT_TYPES.includes(normalizedDocumentType)) {
            return res.status(400).json({ message: 'Invalid document type' });
        }

        const actor = await User.findByPk(userId);
        if (!actor) {
            return res.status(403).json({ message: 'User not found for this action' });
        }

        if (!canUserUploadDocument(actor, request)) {
            return res.status(403).json({ message: 'You are not allowed to upload document for this request' });
        }

        const documents = Array.isArray(request.documents) ? [...request.documents] : [];
        documents.push({
            id: crypto.randomUUID(),
            originalName: file.originalname,
            fileName: file.filename,
            mimeType: file.mimetype,
            size: file.size,
            url: `/uploads/${file.filename}`,
            documentType: normalizedDocumentType,
            uploadedAt: new Date(),
        });

        const updatedSteps = { ...buildDefaultSteps(), ...(request.steps || {}) };
        const now = new Date();

        if (normalizedDocumentType === 'internship_receipt') {
            const normalizedInternshipStatus = normalizeStepStatus(updatedSteps.internship_fee_check?.status);
            if (normalizedInternshipStatus === 'waiting' || normalizedInternshipStatus === 'rejected') {
                updatedSteps.internship_fee_check = {
                    status: 'waiting',
                    comment: normalizedInternshipStatus === 'rejected'
                        ? 'นิสิตอัปโหลดใบเสร็จค่าออกฝึกใหม่แล้ว กรุณากดยื่นคำร้อง'
                        : 'นิสิตอัปโหลดใบเสร็จค่าออกฝึกแล้ว กรุณากดยื่นคำร้อง',
                    updatedAt: now,
                };
            }
        } else {
            const normalizedFileCheckStatus = normalizeStepStatus(updatedSteps.file_check?.status);
            if (normalizedFileCheckStatus === 'waiting' || normalizedFileCheckStatus === 'rejected') {
                updatedSteps.file_check = {
                    status: 'waiting',
                    comment: normalizedFileCheckStatus === 'rejected'
                        ? 'นิสิตอัปโหลดเอกสารใหม่แล้ว กรุณากดยื่นคำร้อง'
                        : 'นิสิตอัปโหลดเอกสารแล้ว กรุณากดยื่นคำร้อง',
                    updatedAt: now,
                };
            }
        }

        const normalizedSteps = syncLegacyStepAliases(updatedSteps);

        request.documents = documents;
        request.steps = normalizedSteps;
        request.status = computeRequestStatus(normalizedSteps);
        await request.save();

        await AuditLog.create({
            userId: actor.id,
            action: 'UPLOAD_DOCUMENT',
            requestId: id,
            details: `uploaded ${normalizedDocumentType}: ${file.originalname}`
        });

        return res.json({
            success: true,
            message: 'File uploaded successfully',
            document: documents[documents.length - 1],
            request,
        });
    } catch (error) {
        return handleServerError(res, error);
    }
});

// [Notification Routes]
app.get('/api/notifications/:userId', async (req, res) => {
    try {
        const notifications = await Notification.findAll({
            where: { userId: req.params.userId },
            order: [['createdAt', 'DESC']]
        });
        res.json(notifications);
    } catch (error) {
        return handleServerError(res, error);
    }
});

app.patch('/api/notifications/:id/read', async (req, res) => {
    try {
        await Notification.update({ isRead: true }, { where: { id: req.params.id } });
        res.json({ success: true });
    } catch (error) {
        return handleServerError(res, error);
    }
});

app.patch('/api/notifications/user/:userId/read-all', async (req, res) => {
    try {
        await Notification.update({ isRead: true }, { where: { userId: req.params.userId, isRead: false } });
        res.json({ success: true });
    } catch (error) {
        return handleServerError(res, error);
    }
});


// --- 5. Start Server & Sync DB ---
async function bootstrapServer() {
    try {
        await sequelize.sync({ alter: true });
    } catch (error) {
        console.warn('⚠️ Database alter failed, fallback to safe sync:', error.message);
        await sequelize.sync();
    }

    console.log('✅ Database synced successfully');

    const adminPasswordHash = await hashPassword('admin1234');
    const officePasswordHash = await hashPassword('office1234');
    const advisorPasswordHash = await hashPassword('a1234');
    const studentPasswordHash = await hashPassword('s1234');

    // Seed Admin User
    await User.findOrCreate({
        where: { email: 'admin@sskru.ac.th' },
        defaults: {
            id: 'admin',
            name: 'System Admin',
            password: adminPasswordHash,
            role: 'Admin'
        }
    });

    // Seed Office Users
    for (const dept of officeDepts) {
        const id = dept.toLowerCase().replace(/\s+/g, '_');
        const email = `office_${id}@sskru.ac.th`;
        await User.findOrCreate({
            where: { email },
            defaults: {
                id: `office_${id}`,
                name: `เจ้าหน้าที่ ${dept}`,
                password: officePasswordHash,
                role: 'Office',
                deptName: dept
            }
        });
    }

    // Seed Advisor and Student for each branch
    let advisorCount = 101;
    let studentCount = 101;

    for (const faculty of facultyData) {
        for (const branch of faculty.branches) {
            // Advisor email A1... password a1234
            const advisorId = `A1${advisorCount}`;
            const advisorEmail = `${advisorId}@sskru.ac.th`;
            await User.findOrCreate({
                where: { email: advisorEmail },
                defaults: {
                    id: advisorId,
                    name: `ที่ปรึกษา ${branch}`,
                    password: advisorPasswordHash,
                    role: 'Advisor',
                    faculty: faculty.name,
                    branch: branch
                }
            });
            advisorCount++;

            // Student email S1... password s1234
            const studentId = `S1${studentCount}`;
            const studentEmail = `${studentId}@sskru.ac.th`;
            await User.findOrCreate({
                where: { email: studentEmail },
                defaults: {
                    id: studentId,
                    name: `นักศึกษา ${branch}`,
                    password: studentPasswordHash,
                    role: 'Student',
                    faculty: faculty.name,
                    branch: branch
                }
            });
            studentCount++;
        }
    }

    const sampleStudents = await User.findAll({
        where: { role: 'Student' },
        order: [['id', 'ASC']],
        limit: 8
    });

    const sampleRequests = [
        {
            academicYear: '2569',
            semester: '1',
            steps: {
                advisor: { status: 'approved', comment: 'ผ่านการตรวจสอบโดยที่ปรึกษา', updatedAt: new Date() },
                language_center: { status: 'waiting', comment: '', updatedAt: null },
                registration: { status: 'waiting', comment: '', updatedAt: null },
                activity_center: { status: 'waiting', comment: '', updatedAt: null },
            }
        },
        {
            academicYear: '2569',
            semester: '1',
            steps: {
                advisor: { status: 'approved', comment: 'เอกสารครบถ้วน', updatedAt: new Date() },
                language_center: { status: 'approved', comment: 'ผ่านเกณฑ์ภาษาอังกฤษ', updatedAt: new Date() },
                registration: { status: 'in_progress', comment: 'กำลังตรวจสอบผลการเรียน', updatedAt: new Date() },
                activity_center: { status: 'waiting', comment: '', updatedAt: null },
            }
        },
        {
            academicYear: '2568',
            semester: '2',
            steps: {
                advisor: { status: 'approved', comment: 'อนุมัติแล้ว', updatedAt: new Date() },
                language_center: { status: 'approved', comment: 'ผ่านครบถ้วน', updatedAt: new Date() },
                registration: { status: 'approved', comment: 'ไม่มีค้างชำระ', updatedAt: new Date() },
                activity_center: { status: 'approved', comment: 'กิจกรรมครบ', updatedAt: new Date() },
            }
        },
        {
            academicYear: '2568',
            semester: '2',
            steps: {
                advisor: { status: 'approved', comment: 'ผ่านเบื้องต้น', updatedAt: new Date() },
                language_center: { status: 'rejected', comment: 'ผลสอบภาษาไม่ถึงเกณฑ์', updatedAt: new Date() },
                registration: { status: 'waiting', comment: '', updatedAt: null },
                activity_center: { status: 'waiting', comment: '', updatedAt: null },
            }
        },
    ];

    for (let index = 0; index < sampleStudents.length; index++) {
        const student = sampleStudents[index];
        const template = sampleRequests[index % sampleRequests.length];
        const status = computeRequestStatus(template.steps);

        await GraduationRequest.findOrCreate({
            where: {
                studentId: student.id,
                academicYear: template.academicYear,
                semester: template.semester,
            },
            defaults: {
                studentId: student.id,
                academicYear: template.academicYear,
                semester: template.semester,
                steps: template.steps,
                status,
            }
        });
    }

    console.log(`👤 Sample data seeded:`);
    console.log(`   - Admin: admin@sskru.ac.th / admin1234`);
    console.log(`   - Advisors: A1xx@sskru.ac.th / a1234`);
    console.log(`   - Students: S1xx@sskru.ac.th / s1234`);
    console.log(`   - Requests: seeded with connected advisor/language/registration/activity statuses`);

    app.listen(PORT, () => {
        console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
}

bootstrapServer().catch(err => {
    console.error('❌ Failed to sync database:', err);
});
