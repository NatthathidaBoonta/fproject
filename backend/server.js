const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config({ override: true });

const { sequelize } = require('./models/index');
const { seedDatabase } = require('./seed/index');
const { uploadsDir } = require('./middleware/upload');
const { facultyData, officeDepts } = require('./data/masterData');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const requestRoutes = require('./routes/requests');
const notificationRoutes = require('./routes/notifications');

const app = express();
const PORT = process.env.PORT || 5000;

// --- CORS ---
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',').map(o => o.trim()).filter(Boolean);

const corsOptions = allowedOrigins.length > 0
    ? {
        origin: (origin, cb) => {
            if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
            return cb(new Error('CORS policy violation'));
        },
    }
    : {};

// --- Middleware ---
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
app.use('/uploads', express.static(uploadsDir));

// --- Routes ---
app.get('/api/master-data', (_req, res) => res.json({ faculties: facultyData, departments: officeDepts }));
app.use('/api', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/notifications', notificationRoutes);

// --- Bootstrap ---
async function bootstrap() {
    try {
        await sequelize.sync({ alter: true });
    } catch {
        await sequelize.sync();
    }
    console.log('✅ Database synced');

    await seedDatabase();

    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
}

bootstrap().catch(err => {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
});
