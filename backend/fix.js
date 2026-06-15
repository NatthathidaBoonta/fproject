const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'database.sqlite'),
    logging: false,
});

const GraduationRequest = sequelize.define('GraduationRequest', {
    id: { type: DataTypes.UUID, primaryKey: true },
    steps: DataTypes.JSON,
    status: DataTypes.STRING,
});

function getCanonicalStepStatuses(steps) {
    const normalizeStepStatus = (status) => {
        const normalized = String(status || '').trim().toLowerCase();
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

const WORKFLOW_STEPS = [
    'file_check', 'tuition_check', 'grade_check', 'internship_fee_check',
    'library_check', 'activity_general_check', 'activity_faculty_check',
    'digital_exam_check', 'language_center', 'advisor'
];

function computeRequestStatus(steps) {
    const canonicalStatuses = getCanonicalStepStatuses(steps);
    const statuses = WORKFLOW_STEPS.map(stepKey => canonicalStatuses[stepKey]);

    if (statuses.some(status => status === 'rejected')) return 'Rejected';
    if (statuses.every(status => status === 'approved')) return 'Completed';
    if (statuses.some(status => status === 'approved' || status === 'in_progress')) return 'In Progress';
    return 'Pending';
}

async function fix() {
    await sequelize.authenticate();
    const requests = await GraduationRequest.findAll();
    let count = 0;
    for (let req of requests) {
        if (req.status === 'In Progress') {
            let steps = req.steps || {};
            let modified = false;
            
            // Revert 'in_progress' to 'waiting' for upload steps if no other step was 'approved' or 'in_progress'
            if (steps.file_check?.status === 'in_progress') {
                steps.file_check.status = 'waiting';
                modified = true;
            }
            if (steps.internship_fee_check?.status === 'in_progress') {
                steps.internship_fee_check.status = 'waiting';
                modified = true;
            }
            
            if (modified) {
                const newStatus = computeRequestStatus(steps);
                req.steps = steps;
                req.status = newStatus;
                await req.save();
                count++;
            }
        }
    }
    console.log(`Fixed ${count} requests.`);
}

fix();
