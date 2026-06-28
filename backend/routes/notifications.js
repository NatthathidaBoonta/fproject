const express = require('express');
const { Notification } = require('../models/index');
const { handleServerError } = require('../middleware/helpers');

const router = express.Router();

router.get('/:userId', async (req, res) => {
    try {
        const notifications = await Notification.findAll({
            where: { userId: req.params.userId },
            order: [['createdAt', 'DESC']],
        });
        return res.json(notifications);
    } catch (error) {
        return handleServerError(res, error);
    }
});

router.patch('/:id/read', async (req, res) => {
    try {
        await Notification.update({ isRead: true }, { where: { id: req.params.id } });
        return res.json({ success: true });
    } catch (error) {
        return handleServerError(res, error);
    }
});

router.patch('/user/:userId/read-all', async (req, res) => {
    try {
        await Notification.update(
            { isRead: true },
            { where: { userId: req.params.userId, isRead: false } }
        );
        return res.json({ success: true });
    } catch (error) {
        return handleServerError(res, error);
    }
});

module.exports = router;
