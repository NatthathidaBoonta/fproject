const express = require('express');
const crypto = require('crypto');
const { GraduationRequest, User, Notification, AuditLog } = require('../models/index');
const { upload } = require('../middleware/upload');
const {
    buildDefaultSteps, syncLegacyStepAliases, computeRequestStatus,
    normalizeStepStatus, canUserReadRequest, canUserUpdateStep,
    canUserSubmitRequest, canUserUploadDocument,
    sanitizeRequestPayload, handleServerError,
} = require('../middleware/helpers');
const {
    VALID_STEPS, VALID_STEP_STATUSES, VALID_DOCUMENT_TYPES, WORKFLOW_STEPS, STEP_LABELS,
} = require('../config/constants');

const router = express.Router();

async function notifyReviewers(request) {
    const student = await User.findByPk(request.studentId);
    if (!student) return;

    const advisors = await User.findAll({ where: { role: 'Advisor', faculty: student.faculty, branch: student.branch } });
    const officers = await User.findAll({
        where: { role: 'Office', deptName: ['ฝ่ายทะเบียน', 'ฝ่ายวิทยบริการและเทคโนโลยี', 'ฝ่ายศูนย์ภาษา', 'ฝ่ายกิจกรรม'] },
    });

    const message = `มีคำร้องขอจบการศึกษาใหม่จาก ${student.name} (${student.id}) รอการตรวจสอบ`;
    for (const u of [...advisors, ...officers]) {
        await Notification.create({ userId: u.id, message, type: 'REVIEW_ASSIGNED' });
    }
}

router.get('/', async (req, res) => {
    try {
        const { step, studentId, userId, submittedOnly } = req.query;
        if (!userId || typeof userId !== 'string') {
            return res.status(400).json({ message: 'userId query is required' });
        }
        const actor = await User.findByPk(userId);
        if (!actor) return res.status(403).json({ message: 'User not found for this action' });

        let requests = await GraduationRequest.findAll({
            where: studentId ? { studentId } : undefined,
            include: [{ model: User, attributes: ['name', 'faculty', 'branch', 'deptName'] }],
        });

        requests = requests.filter(r => canUserReadRequest(actor, r));

        if (step) {
            const target = String(step);
            if (!VALID_STEPS.includes(target)) return res.status(400).json({ message: 'Invalid step filter' });
            requests = requests.filter(r => r?.steps?.[target]);
        }

        if (String(submittedOnly || '').toLowerCase() === 'true') {
            requests = requests.filter(r => {
                const statuses = VALID_STEPS.map(k => normalizeStepStatus(r?.steps?.[k]?.status));
                return statuses.some(s => s !== 'waiting');
            });
        }

        return res.json(requests);
    } catch (error) {
        return handleServerError(res, error);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId || typeof userId !== 'string') {
            return res.status(400).json({ message: 'userId query is required' });
        }
        const actor = await User.findByPk(userId);
        if (!actor) return res.status(403).json({ message: 'User not found for this action' });

        const request = await GraduationRequest.findByPk(req.params.id, {
            include: [{ model: User, attributes: ['name', 'faculty', 'branch', 'deptName'] }],
        });
        if (!request) return res.status(404).json({ message: 'Request not found' });
        if (!canUserReadRequest(actor, request)) {
            return res.status(403).json({ message: 'You are not allowed to view this request' });
        }
        return res.json(request);
    } catch (error) {
        return handleServerError(res, error);
    }
});

router.post('/', async (req, res) => {
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
        const newRequest = await GraduationRequest.create({ ...payload, steps, status: computeRequestStatus(steps) });
        return res.status(201).json(newRequest);
    } catch (error) {
        return handleServerError(res, error);
    }
});

router.post('/:id/submit', async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;
        if (!userId || typeof userId !== 'string') return res.status(400).json({ message: 'Invalid userId' });

        const actor = await User.findByPk(userId);
        if (!actor) return res.status(403).json({ message: 'User not found for this action' });

        const request = await GraduationRequest.findByPk(id);
        if (!request) return res.status(404).json({ message: 'Request not found' });
        if (!canUserSubmitRequest(actor, request)) return res.status(403).json({ message: 'You are not allowed to submit this request' });
        if (request.status === 'Completed') return res.status(400).json({ message: 'Completed request cannot be submitted again' });

        const now = new Date();
        const updatedSteps = { ...buildDefaultSteps(), ...(request.steps || {}) };
        let hasChanged = false;
        const shouldReopen = request.status !== 'Rejected';

        for (const key of WORKFLOW_STEPS) {
            const cur = updatedSteps[key] || { status: 'waiting', comment: '', updatedAt: null };
            const norm = normalizeStepStatus(cur.status);
            if (norm === 'rejected' || (shouldReopen && norm === 'waiting')) {
                updatedSteps[key] = { ...cur, status: 'in_progress', updatedAt: now };
                hasChanged = true;
            }
        }

        const normalized = syncLegacyStepAliases(updatedSteps);
        request.steps = normalized;
        request.status = computeRequestStatus(normalized);
        request.submittedAt = now;
        await request.save();

        await AuditLog.create({ userId: actor.id, action: 'SUBMIT_REQUEST_FOR_REVIEW', requestId: id, details: `submitted by: ${actor.id}` });
        if (hasChanged) await notifyReviewers(request);

        return res.json({ success: true, message: hasChanged ? 'Request submitted for review' : 'Already in review', data: request });
    } catch (error) {
        return handleServerError(res, error);
    }
});

router.patch('/batch/step', async (req, res) => {
    const { ids, step, status, comment, userId } = req.body;
    try {
        if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ message: 'Invalid or empty ids array' });
        if (!VALID_STEPS.includes(step)) return res.status(400).json({ message: 'Invalid step' });

        const normStatus = normalizeStepStatus(status);
        if (!VALID_STEP_STATUSES.includes(normStatus)) return res.status(400).json({ message: 'Invalid step status' });
        if (!userId || typeof userId !== 'string') return res.status(400).json({ message: 'Invalid userId' });

        const actor = await User.findByPk(userId);
        if (!actor) return res.status(403).json({ message: 'User not found for this action' });
        if (!canUserUpdateStep(actor, step)) return res.status(403).json({ message: 'You are not allowed to update this step' });

        const safeComment = typeof comment === 'string' ? comment.trim() : '';

        for (const id of ids) {
            const request = await GraduationRequest.findByPk(id);
            if (!request) continue;

            const updatedSteps = { ...buildDefaultSteps(), ...(request.steps || {}) };
            if (!updatedSteps[step]) continue;

            const cur = normalizeStepStatus(updatedSteps[step]?.status);
            if (cur === 'approved' && normStatus !== 'approved') continue;

            updatedSteps[step] = { status: normStatus, comment: safeComment, updatedAt: new Date() };
            const normalized = syncLegacyStepAliases(updatedSteps);
            request.steps = normalized;
            request.status = computeRequestStatus(normalized);
            await request.save();

            if (normStatus === 'rejected') {
                await Notification.create({ userId: request.studentId, message: `คำร้องในส่วน ${STEP_LABELS[step] || step} ถูกปฏิเสธ${safeComment ? `: ${safeComment}` : ''}`, type: 'REJECTED' });
            } else if (request.status === 'Completed') {
                await Notification.create({ userId: request.studentId, message: 'คำร้องขอจบการศึกษาของคุณผ่านการตรวจสอบครบแล้ว', type: 'COMPLETED' });
            }

            await AuditLog.create({ userId, action: 'UPDATE_STEP_STATUS', requestId: id, details: `[Batch] ${step} → ${normStatus} by ${userId}` });
        }

        return res.json({ success: true, count: ids.length });
    } catch (error) {
        return handleServerError(res, error);
    }
});

router.patch('/:id/step', async (req, res) => {
    const { id } = req.params;
    const { step, status, comment, userId } = req.body;
    try {
        if (!VALID_STEPS.includes(step)) return res.status(400).json({ message: 'Invalid step' });
        const normStatus = normalizeStepStatus(status);
        if (!VALID_STEP_STATUSES.includes(normStatus)) return res.status(400).json({ message: 'Invalid step status' });
        if (!userId || typeof userId !== 'string') return res.status(400).json({ message: 'Invalid userId' });

        const actor = await User.findByPk(userId);
        if (!actor) return res.status(403).json({ message: 'User not found for this action' });
        if (!canUserUpdateStep(actor, step)) return res.status(403).json({ message: 'You are not allowed to update this step' });

        const request = await GraduationRequest.findByPk(id);
        if (!request) return res.status(404).json({ message: 'Request not found' });

        const updatedSteps = { ...buildDefaultSteps(), ...(request.steps || {}) };
        if (!updatedSteps[step]) return res.status(400).json({ message: 'Invalid step' });

        const cur = normalizeStepStatus(updatedSteps[step]?.status);
        if (cur === 'approved' && normStatus !== 'approved') {
            return res.status(400).json({ message: 'Cannot modify a step that has already been approved' });
        }

        const safeComment = typeof comment === 'string' ? comment.trim() : '';
        updatedSteps[step] = { status: normStatus, comment: safeComment, updatedAt: new Date() };

        const normalized = syncLegacyStepAliases(updatedSteps);
        request.steps = normalized;
        request.status = computeRequestStatus(normalized);
        await request.save();

        if (normStatus === 'rejected') {
            await Notification.create({ userId: request.studentId, message: `คำร้องในส่วน ${STEP_LABELS[step] || step} ถูกปฏิเสธ${safeComment ? `: ${safeComment}` : ''}`, type: 'REJECTED' });
        } else if (request.status === 'Completed') {
            await Notification.create({ userId: request.studentId, message: 'คำร้องขอจบการศึกษาของคุณผ่านการตรวจสอบครบแล้ว', type: 'COMPLETED' });
        }

        await AuditLog.create({ userId, action: 'UPDATE_STEP_STATUS', requestId: id, details: `${step} → ${normStatus} by ${userId}` });

        return res.json({ success: true, data: request });
    } catch (error) {
        return handleServerError(res, error);
    }
});

router.post('/:id/documents', (req, res, next) => {
    upload.single('file')(req, res, (error) => {
        if (!error) return next();
        if (error.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ message: 'File size exceeds 5MB limit' });
        if (error.message === 'Invalid file type') return res.status(400).json({ message: 'Only PDF, JPG, and PNG files are allowed' });
        return res.status(400).json({ message: 'Upload failed' });
    });
}, async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, documentType } = req.body;
        const file = req.file;

        if (!file) return res.status(400).json({ message: 'File is required' });
        if (!userId || typeof userId !== 'string') return res.status(400).json({ message: 'Invalid userId' });

        const normType = String(documentType || 'general').trim().toLowerCase();
        if (!VALID_DOCUMENT_TYPES.includes(normType)) return res.status(400).json({ message: 'Invalid document type' });

        const request = await GraduationRequest.findByPk(id);
        if (!request) return res.status(404).json({ message: 'Request not found' });

        const actor = await User.findByPk(userId);
        if (!actor) return res.status(403).json({ message: 'User not found for this action' });
        if (!canUserUploadDocument(actor, request)) return res.status(403).json({ message: 'You are not allowed to upload documents for this request' });

        const documents = Array.isArray(request.documents) ? [...request.documents] : [];
        documents.push({
            id: crypto.randomUUID(),
            originalName: file.originalname,
            fileName: file.filename,
            mimeType: file.mimetype,
            size: file.size,
            url: `/uploads/${file.filename}`,
            documentType: normType,
            uploadedAt: new Date(),
        });

        const updatedSteps = { ...buildDefaultSteps(), ...(request.steps || {}) };
        const now = new Date();

        if (normType === 'internship_receipt') {
            const cur = normalizeStepStatus(updatedSteps.internship_fee_check?.status);
            if (cur === 'waiting' || cur === 'rejected') {
                updatedSteps.internship_fee_check = {
                    status: 'waiting',
                    comment: cur === 'rejected' ? 'นิสิตอัปโหลดใบเสร็จค่าออกฝึกใหม่แล้ว กรุณากดยื่นคำร้อง' : 'นิสิตอัปโหลดใบเสร็จค่าออกฝึกแล้ว กรุณากดยื่นคำร้อง',
                    updatedAt: now,
                };
            }
        } else {
            const cur = normalizeStepStatus(updatedSteps.file_check?.status);
            if (cur === 'waiting' || cur === 'rejected') {
                updatedSteps.file_check = {
                    status: 'waiting',
                    comment: cur === 'rejected' ? 'นิสิตอัปโหลดเอกสารใหม่แล้ว กรุณากดยื่นคำร้อง' : 'นิสิตอัปโหลดเอกสารแล้ว กรุณากดยื่นคำร้อง',
                    updatedAt: now,
                };
            }
        }

        const normalized = syncLegacyStepAliases(updatedSteps);
        request.documents = documents;
        request.steps = normalized;
        request.status = computeRequestStatus(normalized);
        await request.save();

        await AuditLog.create({ userId: actor.id, action: 'UPLOAD_DOCUMENT', requestId: id, details: `uploaded ${normType}: ${file.originalname}` });

        return res.json({ success: true, message: 'File uploaded successfully', document: documents[documents.length - 1], request });
    } catch (error) {
        return handleServerError(res, error);
    }
});

module.exports = router;
