const express = require('express');
const rateLimit = require('express-rate-limit');
const { User } = require('../models/index');
const { verifyPassword, hashPassword, handleServerError } = require('../middleware/helpers');
const { PASSWORD_PREFIX } = require('../config/constants');

const router = express.Router();

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: 'Too many login attempts, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post('/login', loginLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(401).json({ message: 'Email or password incorrect' });

        const valid = await verifyPassword(password, user.password);
        if (!valid) return res.status(401).json({ message: 'Email or password incorrect' });

        if (!String(user.password).startsWith(`${PASSWORD_PREFIX}$`)) {
            user.password = await hashPassword(password);
            await user.save();
        }

        const { password: _, ...safe } = user.toJSON();
        return res.json(safe);
    } catch (error) {
        return handleServerError(res, error);
    }
});

module.exports = router;
