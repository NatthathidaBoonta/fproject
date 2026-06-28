const express = require('express');
const { User } = require('../models/index');
const { hashPassword, sanitizeUserPayload, handleServerError } = require('../middleware/helpers');
const { VALID_ROLES } = require('../config/constants');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const users = await User.findAll({ attributes: { exclude: ['password'] } });
        return res.json(users);
    } catch (error) {
        return handleServerError(res, error);
    }
});

router.post('/', async (req, res) => {
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
        const { password, ...safe } = user.toJSON();
        return res.status(201).json(safe);
    } catch (error) {
        return handleServerError(res, error);
    }
});

router.put('/:id', async (req, res) => {
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
            const user = await User.findByPk(id, { attributes: { exclude: ['password'] } });
            return res.json(user);
        }
        return res.status(404).json({ message: 'User not found' });
    } catch (error) {
        return handleServerError(res, error);
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await User.destroy({ where: { id } });
        if (deleted) return res.json({ message: 'User deleted' });
        return res.status(404).json({ message: 'User not found' });
    } catch (error) {
        return handleServerError(res, error);
    }
});

module.exports = router;
